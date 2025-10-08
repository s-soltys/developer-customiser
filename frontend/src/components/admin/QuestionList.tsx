import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQuestions, useDeleteQuestion, useUpdateQuestion } from '../../hooks/admin/useQuestions';
import { useCategories } from '../../hooks/admin/useCategories';
import { QuestionItem } from './QuestionItem';
import { QuestionForm } from './QuestionForm';

interface Question {
  id: string;
  text: string;
  categoryId: string;
  order: number;
  active: boolean;
}

/**
 * List of questions with drag-and-drop reordering.
 * Groups questions by category and allows reordering within each category.
 */
export function QuestionList() {
  const { data: categories } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const { data: questions, isLoading, error } = useQuestions(selectedCategoryId || undefined);
  const deleteQuestion = useDeleteQuestion();
  const updateQuestion = useUpdateQuestion();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading questions...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">Error loading questions: {error.message}</p>
      </div>
    );
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !questions) {
      return;
    }

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder locally (optimistic update)
    const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);

    // Update order values on the server
    try {
      await updateQuestion.mutateAsync({
        id: active.id as string,
        order: newIndex,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to reorder question');
    }
  };

  const handleDelete = async (question: Question) => {
    try {
      await deleteQuestion.mutateAsync(question.id);
      setDeletingQuestion(null);
    } catch (error: any) {
      alert(error.message || 'Failed to delete question');
    }
  };

  const groupedQuestions = questions?.reduce((acc, question) => {
    if (!acc[question.categoryId]) {
      acc[question.categoryId] = [];
    }
    acc[question.categoryId].push(question);
    return acc;
  }, {} as Record<string, Question[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add Question
        </button>
      </div>

      {/* Category filter */}
      <div className="flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setSelectedCategoryId(null)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            selectedCategoryId === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Categories
        </button>
        {categories?.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategoryId(category.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              selectedCategoryId === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Create New Question</h3>
          <QuestionForm
            categories={categories || []}
            onSuccess={() => setShowCreateForm(false)}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {editingQuestion && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Edit Question</h3>
          <QuestionForm
            question={editingQuestion}
            categories={categories || []}
            onSuccess={() => setEditingQuestion(null)}
            onCancel={() => setEditingQuestion(null)}
          />
        </div>
      )}

      {/* Questions grouped by category */}
      {selectedCategoryId ? (
        // Single category view with drag-and-drop
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions?.map((q) => q.id) || []} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-gray-200">
                {questions?.map((question) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    categoryName={categories?.find((c) => c.id === question.categoryId)?.name || 'Unknown'}
                    onEdit={() => setEditingQuestion(question)}
                    onDelete={() => setDeletingQuestion(question)}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
        // All categories view (no drag-and-drop across categories)
        <div className="space-y-6">
          {Object.entries(groupedQuestions || {}).map(([categoryId, categoryQuestions]) => {
            const category = categories?.find((c) => c.id === categoryId);
            return (
              <div key={categoryId} className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">{category?.name || 'Unknown Category'}</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                  {categoryQuestions.map((question) => (
                    <li key={question.id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-500">#{question.order}</span>
                            <p className="text-sm text-gray-900">{question.text}</p>
                            {!question.active && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => setEditingQuestion(question)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingQuestion(question)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingQuestion && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Question</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this question?
            </p>
            <p className="text-sm text-gray-700 mb-2 font-medium">"{deletingQuestion.text}"</p>
            <p className="text-sm text-gray-500 mb-6">
              This will soft-delete the question. Existing user responses will be preserved.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deletingQuestion)}
                disabled={deleteQuestion.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                {deleteQuestion.isPending ? 'Deleting...' : 'Delete Question'}
              </button>
              <button
                onClick={() => setDeletingQuestion(null)}
                disabled={deleteQuestion.isPending}
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
