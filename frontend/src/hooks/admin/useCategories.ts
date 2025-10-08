import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminPassword } from './useAdminAuth';

const API_BASE = 'http://localhost:8080/api/admin';

interface Category {
  id: string;
  name: string;
  order: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateCategoryInput {
  name: string;
  order: number;
}

interface UpdateCategoryInput {
  name?: string;
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
 * Hook to fetch all categories (including inactive).
 */
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/categories`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch categories');
      }

      return response.json();
    },
  });
}

/**
 * Hook to create a new category.
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) => {
      const response = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

/**
 * Hook to update a category.
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateCategoryInput & { id: string }) => {
      const response = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update category');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

/**
 * Hook to soft delete a category.
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, cascade = false }: { id: string; cascade?: boolean }) => {
      const url = cascade
        ? `${API_BASE}/categories/${id}?cascade=true`
        : `${API_BASE}/categories/${id}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok && response.status !== 204) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
    },
  });
}
