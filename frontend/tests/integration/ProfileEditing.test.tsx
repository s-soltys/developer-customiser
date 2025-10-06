import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Summary } from '../../src/pages/Summary'
import { Questionnaire } from '../../src/pages/Questionnaire'
import * as api from '../../src/services/api'
import type { Profile, Question } from '../../src/types/api'

// Mock API module
vi.mock('../../src/services/api', () => ({
  useGetProfileById: vi.fn(),
  useGetQuestions: vi.fn(),
  useUpdateProfile: vi.fn(),
}))

const mockQuestions: Question[] = [
  {
    id: '1',
    categoryId: 'communication',
    questionId: 'preferred-channel',
    text: 'What is your preferred communication channel?',
    type: 'CHOICE',
    choices: ['Email', 'Slack', 'In-person'],
    order: 0,
  },
  {
    id: '2',
    categoryId: 'communication',
    questionId: 'response-time',
    text: 'What is your typical response time?',
    type: 'TEXT',
    placeholder: 'e.g., within 24 hours',
    order: 1,
  },
]

const mockProfile: Profile = {
  id: 'profile-123',
  name: 'Jane Smith',
  shareableId: 'xyz-456-abc',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  responses: {
    communication: {
      'preferred-channel': {
        value: 'Email',
        answeredAt: '2024-01-01T00:00:00Z',
      },
      'response-time': {
        value: 'within 48 hours',
        answeredAt: '2024-01-01T00:00:00Z',
      },
    },
  },
}

describe('ProfileEditing Integration Test', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  it('should allow editing profile from Summary page', async () => {
    const user = userEvent.setup()

    vi.mocked(api.useGetProfileById).mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(api.useGetQuestions).mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      error: null,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/summary',
              state: { profileId: 'profile-123' },
            },
          ]}
        >
          <Routes>
            <Route path="/summary" element={<Summary />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    // Verify existing responses are displayed
    expect(screen.getByText(/Email/i)).toBeInTheDocument()
    expect(screen.getByText(/within 48 hours/i)).toBeInTheDocument()

    // Find and click "Edit Profile" button
    const editButton = screen.getByRole('button', { name: /Edit Profile/i })
    expect(editButton).toBeInTheDocument()
    await user.click(editButton)

    // Note: Navigation to questionnaire with existing responses would be tested in E2E
    // Here we verify the button exists and can be clicked
  })

  it('should preserve existing responses when editing', async () => {
    const user = userEvent.setup()

    vi.mocked(api.useGetQuestions).mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(api.useUpdateProfile).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    // Render Questionnaire with existing responses
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/questionnaire',
              state: {
                profileId: 'profile-123',
                existingResponses: mockProfile.responses,
              },
            },
          ]}
        >
          <Routes>
            <Route path="/questionnaire" element={<Questionnaire />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText(/Communication Preferences/i)).toBeInTheDocument()
    })

    // Verify existing response is pre-filled for CHOICE type
    const emailRadio = screen.getByLabelText('Email')
    expect(emailRadio).toBeChecked()

    // Verify existing response is pre-filled for TEXT type
    const responseTimeInput = screen.getByPlaceholderText(/e.g., within 24 hours/i)
    expect(responseTimeInput).toHaveValue('within 48 hours')

    // User can modify responses
    const slackRadio = screen.getByLabelText('Slack')
    await user.click(slackRadio)

    // Verify change was applied
    expect(slackRadio).toBeChecked()
    expect(emailRadio).not.toBeChecked()
  })

  it('should display updated responses after modification', async () => {
    const updatedProfile: Profile = {
      ...mockProfile,
      responses: {
        communication: {
          'preferred-channel': {
            value: 'Slack',
            answeredAt: '2024-01-02T00:00:00Z',
          },
          'response-time': {
            value: 'within 24 hours',
            answeredAt: '2024-01-02T00:00:00Z',
          },
        },
      },
      updatedAt: '2024-01-02T00:00:00Z',
    }

    vi.mocked(api.useGetProfileById).mockReturnValue({
      data: updatedProfile,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(api.useGetQuestions).mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      error: null,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/summary',
              state: { profileId: 'profile-123' },
            },
          ]}
        >
          <Routes>
            <Route path="/summary" element={<Summary />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for updated profile to load
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    // Verify updated responses are displayed
    expect(screen.getByText(/Slack/i)).toBeInTheDocument()
    expect(screen.getByText(/within 24 hours/i)).toBeInTheDocument()

    // Verify updated timestamp
    expect(screen.getByText(/Last updated: 1\/2\/2024/i)).toBeInTheDocument()
  })
})
