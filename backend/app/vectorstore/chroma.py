from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from app.core.config import settings
import chromadb
from chromadb.config import Settings as ChromaSettings

# Initialize the embedding model
# We use a fast, local embedding model
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Initialize ChromaDB client
chroma_client = chromadb.HttpClient(
    host=settings.CHROMA_URL.split("://")[1].split(":")[0] if "://" in settings.CHROMA_URL else "localhost",
    port=settings.CHROMA_URL.split(":")[2] if len(settings.CHROMA_URL.split(":")) > 2 else "8000"
)

def get_vectorstore(collection_name: str = "ai_knowledge"):
    """
    Returns a LangChain Chroma vectorstore instance connected to the ChromaDB server.
    """
    return Chroma(
        client=chroma_client,
        collection_name=collection_name,
        embedding_function=embeddings
    )
