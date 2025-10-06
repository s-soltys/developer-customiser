// TypeScript types matching the OpenAPI specification

export type QuestionType = 'TEXT' | 'CHOICE' | 'MULTICHOICE'

export interface Question {
  id: string
  categoryId: string
  questionId: string
  text: string
  type: QuestionType
  choices?: string[]
  placeholder?: string
  order: number
}

export interface Response {
  value: string | string[]
  answeredAt: string  // ISO 8601 format
}

export interface Profile {
  id: string
  name: string
  shareableId: string
  createdAt: string  // ISO 8601 format
  updatedAt: string  // ISO 8601 format
  responses: Record<string, Record<string, Response>>
}

export interface CreateProfileRequest {
  name: string
}

export interface UpdateProfileRequest {
  responses: Record<string, Record<string, Response>>
}

export interface ErrorResponse {
  error: string
}

// Category information
export const CATEGORIES = [
  { id: 'communication', displayName: 'Communication Preferences' },
  { id: 'work-style', displayName: 'Work Style' },
  { id: 'feedback', displayName: 'Feedback Style' },
  { id: 'strengths', displayName: 'Strengths & Growing Areas' },
  { id: 'pet-peeves', displayName: 'Pet Peeves & Energizers' },
  { id: 'personal', displayName: 'Personal Context' },
] as const

export type CategoryId = typeof CATEGORIES[number]['id']
