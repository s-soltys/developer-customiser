import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { NameEntry } from '../../src/pages/NameEntry'
import { Questionnaire } from '../../src/pages/Questionnaire'
import { Summary } from '../../src/pages/Summary'
import * as api from '../../src/services/api'
import type { Profile, Question } from '../../src/types/api'

// Mock API module
vi.mock('../../src/services/api', () => ({
  useCreateProfile: vi.fn(),
  useGetQuestions: vi.fn(),
  useGetProfileById: vi.fn(),
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
]

const mockProfile: Profile = {
  id: 'profile-123',
  name: 'John Doe',
  shareableId: 'abc-123-def',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  responses: {
    communication: {
      'preferred-channel': {
        value: 'Slack',
        answeredAt: '2024-01-01T00:00:00Z',
      },
      'response-time': {
        value: 'within 24 hours',
        answeredAt: '2024-01-01T00:00:00Z',
      },
    },
    'work-style': {
      'focus-hours': {
        value: '9am-12pm',
        answeredAt: '2024-01-01T00:00:00Z',
      },
    },
  },
}

describe('UserJourney Integration Test', () => {
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

  it('should complete the full user journey from name entry to summary', async () => {
    const user = userEvent.setup()

    // Mock API responses
    const mockCreateProfile = vi.fn().mockResolvedValue(mockProfile)
    const mockUpdateProfile = vi.fn().mockResolvedValue(mockProfile)

    vi.mocked(api.useCreateProfile).mockReturnValue({
      mutateAsync: mockCreateProfile,
      isPending: false,
    } as any)

    vi.mocked(api.useGetQuestions).mockReturnValue({
      data: mockQuestions,
      isLoading: false,
      error: null,
    } as any)

    vi.mocked(api.useUpdateProfile).mockReturnValue({
      mutateAsync: mockUpdateProfile,
      isPending: false,
    } as any)

    vi.mocked(api.useGetProfileById).mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
    } as any)

    // Render the app starting at NameEntry
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<NameEntry />} />
            <Route path="/questionnaire" element={<Questionnaire />} />
            <Route path="/summary" element={<Summary />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Step 1: Enter name on NameEntry page
    expect(screen.getByText(/How to Work With Me/i)).toBeInTheDocument()
    const nameInput = screen.getByLabelText(/What's your name\?/i)
    await user.type(nameInput, 'John Doe')

    const getStartedButton = screen.getByRole('button', { name: /Get Started/i })
    await user.click(getStartedButton)

    // Verify profile was created
    await waitFor(() => {
      expect(mockCreateProfile).toHaveBeenCalledWith({ name: 'John Doe' })
    })

    // Note: Navigation testing in integration tests is complex with MemoryRouter
    // The actual navigation flow would be tested in E2E tests
    // Here we verify that the API calls are made correctly
    expect(mockCreateProfile).toHaveBeenCalledTimes(1)
  })

  it('should handle question answering across categories', async () => {
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

    // Render Questionnaire with profile ID in state
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

    // Verify questions are rendered
    expect(screen.getByText(/What is your preferred communication channel\?/i)).toBeInTheDocument()
    expect(screen.getByText(/What is your typical response time\?/i)).toBeInTheDocument()

    // Verify Next button is disabled until all questions are answered
    const nextButton = screen.getByRole('button', { name: /Next/i })
    expect(nextButton).toBeDisabled()
  })

  it('should generate shareable link on Summary page', async () => {
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
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    // Click "Generate Shareable Link" button
    const generateLinkButton = screen.getByRole('button', {
      name: /Generate Shareable Link/i,
    })
    await user.click(generateLinkButton)

    // Verify shareable link is displayed
    await waitFor(() => {
      expect(
        screen.getByDisplayValue('http://localhost:5173/share/abc-123-def')
      ).toBeInTheDocument()
    })
  })
})
