from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from app.vectorstore.chroma import get_vectorstore
from app.core.config import settings

# Initialize the Gemini LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash", 
    google_api_key=settings.GEMINI_API_KEY,
    temperature=0.2
)

# Enterprise RAG prompt
RAG_TEMPLATE = """
You are an expert Enterprise AI Knowledge Assistant.
Use the following pieces of retrieved context to answer the user's question.
If the answer is not contained within the context, explicitly state that you cannot answer based on the provided documents.
Do not hallucinate or use outside knowledge.

Context:
{context}

Question: {question}

Provide a detailed, professional answer. If applicable, cite the sources from the context using the metadata provided.
"""

prompt = ChatPromptTemplate.from_template(RAG_TEMPLATE)

def format_docs(docs):
    formatted = []
    for d in docs:
        source = d.metadata.get("source", "Unknown Document")
        page = d.metadata.get("page", "Unknown Page")
        formatted.append(f"Source: {source} (Page: {page})\nContent: {d.page_content}")
    return "\n\n".join(formatted)

async def stream_rag_response(query: str, collection_id: str | None = None):
    """
    Streams a RAG response for a given query, returning chunks and citations.
    """
    vectorstore = get_vectorstore()
    
    # Optional filtering by collection
    filter_dict = {}
    if collection_id:
        filter_dict["collection_id"] = collection_id
        
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 5, "filter": filter_dict if filter_dict else None}
    )
    
    # Retrieve documents first to yield citations
    docs = await retriever.ainvoke(query)
    
    citations = [
        {
            "content": doc.page_content,
            "source": doc.metadata.get("source", "Unknown"),
            "page": doc.metadata.get("page", "Unknown"),
            "score": 0.95 # Placeholder for similarity score from Chroma
        }
        for doc in docs
    ]
    
    # Construct the RAG chain
    rag_chain = (
        {"context": lambda x: format_docs(docs), "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )
    
    # Yield citations first
    yield {"type": "citations", "data": citations}
    
    # Stream the generation
    async for chunk in rag_chain.astream(query):
        yield {"type": "chunk", "data": chunk}
