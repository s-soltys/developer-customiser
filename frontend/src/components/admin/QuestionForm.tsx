import { useState } from 'react';
import { useCreateQuestion, useUpdateQuestion } from '../../hooks/admin/useQuestions';

interface Question {
  id: string;
  text: string;
  categoryId: string;
  order: number;
}

interface Category {
  id: string;
  name: string;
  active: boolean;
}

interface QuestionFormProps {
  question?: Question;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Form for creating or editing a question.
 */
export function QuestionForm({ question, categories, onSuccess, onCancel }: QuestionFormProps) {
  const [text, setText] = useState(question?.text || '');
  const [categoryId, setCategoryId] = useState(question?.categoryId || categories[0]?.id || '');
  const [order, setOrder] = useState(question?.order?.toString() || '0');
  const [error, setError] = useState<string | null>(null);

  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();

  const isEditing = !!question;
  const isLoading = createQuestion.isPending || updateQuestion.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError('Question text is required');
      return;
    }

    if (text.length > 500) {
      setError('Question text cannot exceed 500 characters');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    const orderNum = parseInt(order, 10);
    if (isNaN(orderNum) || orderNum < 0) {
      setError('Order must be a non-negative number');
      return;
    }

    try {
      if (isEditing) {
        await updateQuestion.mutateAsync({
          id: question.id,
          text: text.trim(),
          categoryId,
          order: orderNum,
        });
      } else {
        await createQuestion.mutateAsync({
          text: text.trim(),
          categoryId,
          order: orderNum,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save question');
    }
  };

  // Filter only active categories for selection
  const activeCategories = categories.filter((c) => c.active);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 p-3 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="text" className="block text-sm font-medium text-gray-700">
          Question Text
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          placeholder="e.g., What is your preferred communication channel?"
          disabled={isLoading}
          maxLength={500}
        />
        <p className="mt-1 text-sm text-gray-500">{text.length}/500 characters</p>
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="categoryId"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2 border"
          disabled={isLoading}
        >
          {activeCategories.length === 0 && (
            <option value="">No active categories available</option>
          )}
          {activeCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="order" className="block text-sm font-medium text-gray-700">
          Display Order (within category)
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
          disabled={isLoading || activeCategories.length === 0}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Saving...' : isEditing ? 'Update Question' : 'Create Question'}
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
