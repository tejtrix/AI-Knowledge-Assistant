import React, { useState, useEffect } from 'react';
import { getCollections, createCollection, deleteCollection } from '../../services/collection.service';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Collection {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const CollectionManager = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollection, setNewCollection] = useState({ name: '', description: '' });

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      toast.error('Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollection.name.trim()) return;

    try {
      await createCollection(newCollection);
      toast.success('Collection created!');
      setNewCollection({ name: '', description: '' });
      setIsCreating(false);
      fetchCollections();
    } catch (error) {
      toast.error('Failed to create collection');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    
    try {
      await deleteCollection(id);
      toast.success('Collection deleted');
      fetchCollections();
    } catch (error) {
      toast.error('Failed to delete collection');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Your Collections</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium text-sm"
        >
          {isCreating ? 'Cancel' : 'New Collection'}
        </button>
      </div>

      {isCreating && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4"
          onSubmit={handleCreate}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newCollection.name}
              onChange={e => setNewCollection({ ...newCollection, name: e.target.value })}
              placeholder="e.g., Q3 Financial Reports"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={newCollection.description}
              onChange={e => setNewCollection({ ...newCollection, description: e.target.value })}
              placeholder="Brief description of these documents"
              rows={2}
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Create Collection
          </button>
        </motion.form>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">You don't have any collections yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(collection => (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={collection.id}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <h3 className="font-bold text-gray-900 truncate pr-8">{collection.name}</h3>
              {collection.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{collection.description}</p>
              )}
              <div className="mt-4 text-xs text-gray-400">
                Created {format(new Date(collection.created_at), 'MMM d, yyyy')}
              </div>
              
              <button
                onClick={() => handleDelete(collection.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Collection"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
