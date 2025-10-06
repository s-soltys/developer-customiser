import { useQuery, useMutation, UseQueryResult, UseMutationResult } from '@tanstack/react-query'
import type {
  Question,
  Profile,
  CreateProfileRequest,
  UpdateProfileRequest,
  ErrorResponse,
} from '../types/api'

const API_BASE_URL = 'http://localhost:8080'

// Helper function for API calls
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error: ErrorResponse = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }))
    throw new Error(error.error)
  }

  return response.json()
}

// GET /api/questions - Fetch all question templates
export function useGetQuestions(): UseQueryResult<Question[], Error> {
  return useQuery({
    queryKey: ['questions'],
    queryFn: () => apiFetch<Question[]>('/api/questions'),
    staleTime: Infinity, // Questions don't change, cache forever
  })
}

// POST /api/profiles - Create a new profile
export function useCreateProfile(): UseMutationResult<Profile, Error, CreateProfileRequest> {
  return useMutation({
    mutationFn: (data: CreateProfileRequest) =>
      apiFetch<Profile>('/api/profiles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

// GET /api/profiles/:id - Get profile by ID
export function useGetProfileById(id: string | null): UseQueryResult<Profile, Error> {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => apiFetch<Profile>(`/api/profiles/${id}`),
    enabled: !!id, // Only run query if id is provided
  })
}

// PUT /api/profiles/:id - Update profile responses
export function useUpdateProfile(id: string): UseMutationResult<Profile, Error, UpdateProfileRequest> {
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      apiFetch<Profile>(`/api/profiles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  })
}

// GET /api/profiles/share/:shareableId - Get profile by shareable ID
export function useGetProfileByShareableId(shareableId: string | null): UseQueryResult<Profile, Error> {
  return useQuery({
    queryKey: ['profile', 'share', shareableId],
    queryFn: () => apiFetch<Profile>(`/api/profiles/share/${shareableId}`),
    enabled: !!shareableId, // Only run query if shareableId is provided
  })
}
