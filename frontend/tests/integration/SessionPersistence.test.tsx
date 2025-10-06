import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Questionnaire } from '../../src/pages/Questionnaire'
import * as api from '../../src/services/api'
import type { Question } from '../../src/types/api'

// Mock API module
vi.mock('../../src/services/api', () => ({
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
  {
    id: '3',
    categoryId: 'work-style',
    questionId: 'focus-hours',
    text: 'When are your most productive hours?',
    type: 'TEXT',
    order: 0,
  },
  {
    id: '4',
    categoryId: 'work-style',
    questionId: 'collaboration',
    text: 'How do you prefer to collaborate?',
    type: 'TEXT',
    order: 1,
  },
]

describe('SessionPersistence Integration Test', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
    // Clear localStorage and sessionStorage before each test
    localStorage.clear()
    sessionStorage.clear()
  })

  it('should NOT persist progress in localStorage', () => {
    // Verify no localStorage usage
    expect(localStorage.length).toBe(0)

    vi.mocked(api.useGetQuestions).mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(api.useUpdateProfile).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/questionnaire',
              state: { profileId: 'profile-123' },
            },
          ]}
        >
          <Routes>
            <Route path="/questionnaire" element={<Questionnaire />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Component is rendered but should not use localStorage
    expect(localStorage.length).toBe(0)
  })

  it('should NOT persist progress in sessionStorage', () => {
    // Verify no sessionStorage usage
    expect(sessionStorage.length).toBe(0)

    vi.mocked(api.useGetQuestions).mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(api.useUpdateProfile).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/questionnaire',
              state: { profileId: 'profile-123' },
            },
          ]}
        >
          <Routes>
            <Route path="/questionnaire" element={<Questionnaire />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Component is rendered but should not use sessionStorage
    expect(sessionStorage.length).toBe(0)
  })

  it('should lose progress when component unmounts and remounts', async () => {
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

    // First render - answer some questions
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/questionnaire',
              state: { profileId: 'profile-123' },
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

    // Answer first category questions
    const slackRadio = screen.getByLabelText('Slack')
    await user.click(slackRadio)

    const responseTimeInput = screen.getByPlaceholderText(/e.g., within 24 hours/i)
    await user.type(responseTimeInput, 'within 2 hours')

    // Verify answers are filled
    expect(slackRadio).toBeChecked()
    expect(responseTimeInput).toHaveValue('within 2 hours')

    // Unmount component (simulating page close/refresh)
    unmount()

    // Verify no data persisted
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)

    // Remount component - should start fresh
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/questionnaire',
              state: { profileId: 'profile-123' },
            },
          ]}
        >
          <Routes>
            <Route path="/questionnaire" element={<Questionnaire />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for questions to load again
    await waitFor(() => {
      expect(screen.getByText(/Communication Preferences/i)).toBeInTheDocument()
    })

    // Verify previous answers are NOT preserved
    const slackRadioAfter = screen.getByLabelText('Slack')
    const responseTimeInputAfter = screen.getByPlaceholderText(/e.g., within 24 hours/i)

    expect(slackRadioAfter).not.toBeChecked()
    expect(responseTimeInputAfter).toHaveValue('')
  })

  it('should require completing questionnaire in single session', async () => {
    const user = userEvent.setup()

    vi.mocked(api.useGetQuestions).mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      error: null,
    } as any)

    const mockUpdate = vi.fn()
    vi.mocked(api.useUpdateProfile).mockReturnValue({
      mutateAsync: mockUpdate,
      isPending: false,
    } as any)

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/questionnaire',
              state: { profileId: 'profile-123' },
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

    // Fill first category
    const slackRadio = screen.getByLabelText('Slack')
    await user.click(slackRadio)

    const responseTimeInput = screen.getByPlaceholderText(/e.g., within 24 hours/i)
    await user.type(responseTimeInput, 'within 2 hours')

    // Click Next to move to second category
    const nextButton = screen.getByRole('button', { name: /Next/i })
    await user.click(nextButton)

    // Verify we moved to Work Style category
    await waitFor(() => {
      expect(screen.getByText(/Work Style/i)).toBeInTheDocument()
    })

    // Verify update was NOT called yet (only on completion)
    expect(mockUpdate).not.toHaveBeenCalled()

    // Note: Full completion would require answering all 6 categories
    // This test verifies that partial progress doesn't trigger API calls
    // and that the flow requires single-session completion
  })

  it('should navigate back to home if no profileId in state', () => {
    vi.mocked(api.useGetQuestions).mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      error: null,
    } as any)

    // Render without profileId in state
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/questionnaire']}>
          <Routes>
            <Route path="/questionnaire" element={<Questionnaire />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Component should return null (redirect handled by useEffect)
    expect(screen.queryByText(/Communication Preferences/i)).not.toBeInTheDocument()
  })
})
