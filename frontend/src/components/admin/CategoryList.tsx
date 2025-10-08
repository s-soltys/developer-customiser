import { useState } from 'react';
import { useCategories, useDeleteCategory } from '../../hooks/admin/useCategories';
import { CategoryForm } from './CategoryForm';

interface Category {
  id: string;
  name: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * List of categories with edit/delete actions.
 * Shows inactive categories with a badge.
 */
export function CategoryList() {
  const { data: categories, isLoading, error } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) {
    return <div className="text-center py-8">Loading categories...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">Error loading categories: {error.message}</p>
      </div>
    );
  }

  const handleDelete = async (category: Category, cascade: boolean = false) => {
    try {
      await deleteCategory.mutateAsync({ id: category.id, cascade });
      setDeletingCategory(null);
    } catch (error: any) {
      alert(error.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Category
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Create New Category</h3>
          <CategoryForm
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {editingCategory && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
          <CategoryForm
            category={editingCategory}
            onSuccess={() => setEditingCategory(null)}
            onCancel={() => setEditingCategory(null)}
          />
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {categories?.map((category) => (
            <li key={category.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-500">#{category.order}</div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                      {!category.active && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Updated: {new Date(category.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingCategory(category)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Delete confirmation modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Category</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete "{deletingCategory.name}"?
            </p>
            <p className="text-sm text-gray-700 mb-6">
              If this category has active questions, you must delete them as well (cascade delete).
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deletingCategory, false)}
                disabled={deleteCategory.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                Delete Category Only
              </button>
              <button
                onClick={() => handleDelete(deletingCategory, true)}
                disabled={deleteCategory.isPending}
                className="flex-1 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 disabled:bg-gray-400"
              >
                Delete All (Cascade)
              </button>
              <button
                onClick={() => setDeletingCategory(null)}
                disabled={deleteCategory.isPending}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
