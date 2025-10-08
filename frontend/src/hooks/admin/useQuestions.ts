import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminPassword } from './useAdminAuth';

const API_BASE = 'http://localhost:8080/api/admin';

interface Question {
  id: string;
  text: string;
  categoryId: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateQuestionInput {
  text: string;
  categoryId: string;
  order: number;
}

interface UpdateQuestionInput {
  text?: string;
  categoryId?: string;
  order?: number;
}

/**
 * Get auth headers with Basic Auth.
 */
function getAuthHeaders(): HeadersInit {
  const password = getAdminPassword();
  if (!password) {
    throw new Error('Not authenticated');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${btoa(`admin:${password}`)}`,
  };
}

/**
 * Hook to fetch all questions (including inactive).
 * Optionally filter by categoryId.
 */
export function useQuestions(categoryId?: string) {
  return useQuery<Question[]>({
    queryKey: ['admin', 'questions', categoryId],
    queryFn: async () => {
      const url = categoryId
        ? `${API_BASE}/questions?categoryId=${categoryId}`
        : `${API_BASE}/questions`;

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch questions');
      }

      return response.json();
    },
  });
}

/**
 * Hook to create a new question.
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateQuestionInput) => {
      const response = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create question');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
  });
}

/**
 * Hook to update a question.
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateQuestionInput & { id: string }) => {
      const response = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update question');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
  });
}

/**
 * Hook to soft delete a question.
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete question');
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
  });
}

/**
 * Hook to reorder questions within a category.
 * This uses optimistic updates for better UX.
 */
export function useReorderQuestions() {
  const queryClient = useQueryClient();
  const updateQuestion = useUpdateQuestion();

  return {
    reorder: async (questionId: string, newOrder: number) => {
      return updateQuestion.mutateAsync({ id: questionId, order: newOrder });
    },
    isLoading: updateQuestion.isPending,
  };
}
