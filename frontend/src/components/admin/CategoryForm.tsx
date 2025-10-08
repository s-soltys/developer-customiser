import { useState } from 'react';
import { useCreateCategory, useUpdateCategory } from '../../hooks/admin/useCategories';

interface Category {
  id: string;
  name: string;
  order: number;
  active: boolean;
}

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for creating or editing a category.
 */
export function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || '');
  const [order, setOrder] = useState(category?.order?.toString() || '0');
  const [error, setError] = useState<string | null>(null);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const isEditing = !!category;
  const isLoading = createCategory.isPending || updateCategory.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    const orderNum = parseInt(order, 10);
    if (isNaN(orderNum) || orderNum < 0) {
      setError('Order must be a non-negative number');
      return;
    }

    try {
      if (isEditing) {
        await updateCategory.mutateAsync({
          id: category.id,
          name: name.trim(),
          order: orderNum,
        });
      } else {
        await createCategory.mutateAsync({
          name: name.trim(),
          order: orderNum,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 p-3 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Category Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          placeholder="e.g., Communication"
          disabled={isLoading}
          maxLength={100}
        />
      </div>

      <div>
        <label htmlFor="order" className="block text-sm font-medium text-gray-700">
          Display Order
        </label>
        <input
          type="number"
          id="order"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          min="0"
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Lower numbers appear first (0-indexed)
        </p>
      </div>

      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
