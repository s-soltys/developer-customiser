# React Frontend Agent Guidelines

**Context**: Manager Mindset Feedback Tool - React + TypeScript + Tailwind CSS
**Stack**: Vite, React Query, Recharts for radar visualization

---

## Technology Stack

### Core Framework: React 18 + TypeScript
- Functional components with hooks
- TypeScript for type safety
- Vite for fast dev server and builds

### State Management: React Query
- Server state management (API calls)
- Automatic caching and refetching
- Mutations for POST/PUT operations
- No Redux/Zustand needed

### Styling: Tailwind CSS
- Utility-first CSS framework
- No custom CSS needed for most components
- Responsive design with breakpoint prefixes

### Charting: Recharts
- React component library for charts
- Built-in radar chart support
- Declarative API

---

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # App entry point
│   ├── App.tsx               # Root component with routing
│   ├── pages/
│   │   ├── CreateProfile.tsx    # Manager profile creation page
│   │   ├── FeedbackForm.tsx     # Colleague feedback submission
│   │   ├── SuccessScreen.tsx    # Post-submission with radar chart
│   │   └── ResultsDashboard.tsx # Manager admin view
│   ├── components/
│   │   ├── TraitRating.tsx      # 1-5 spinner/slider component
│   │   ├── RadarChart.tsx       # Radar visualization wrapper
│   │   ├── Button.tsx           # Reusable button component
│   │   └── ErrorMessage.tsx     # Error display component
│   ├── services/
│   │   ├── api.ts               # Axios/fetch client setup
│   │   ├── profileQueries.ts    # React Query hooks for profiles
│   │   └── feedbackQueries.ts   # React Query hooks for feedback
│   ├── types/
│   │   ├── profile.ts           # TypeScript interfaces
│   │   └── feedback.ts
│   └── utils/
│       ├── linkHelpers.ts       # Link generation/validation
│       └── chartHelpers.ts      # Data transformation for charts
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## TypeScript Interfaces

### Type Definitions (src/types/)

**profile.ts**:
```typescript
export interface Profile {
  feedbackLinkId: string;
  adminLinkId: string;
  createdAt: string;
}

export interface ProfileCreateResponse {
  feedbackLinkId: string;
  adminLinkId: string;
  createdAt: string;
}
```

**feedback.ts**:
```typescript
export interface TraitQuestion {
  traitId: string;
  label: string;
  leftLabel: string;
  rightLabel: string;
  order: number;
}

export interface TraitRating {
  traitId: string;
  value: number; // 1-5
}

export interface FeedbackSubmission {
  respondentId: string;
  respondentName?: string;
  traits: TraitRating[];
}

export interface FeedbackResponse {
  respondentId: string;
  respondentName: string;
  submittedAt: string;
  traits: TraitRating[];
}

export interface TraitAggregate {
  traitId: string;
  average: number;
  count: number;
  values: number[]; // [count of 1s, 2s, 3s, 4s, 5s]
}

export interface AggregateResults {
  profileId: string;
  totalResponses: number;
  aggregates: TraitAggregate[];
}

export interface ManagerResults {
  adminLinkId: string;
  createdAt: string;
  totalResponses: number;
  responses: FeedbackResponse[];
  aggregates: TraitAggregate[];
}
```

---

## React Query Setup

### API Client Configuration (src/services/api.ts)
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

### Query Provider Setup (src/main.tsx)
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
```

### Profile Queries (src/services/profileQueries.ts)
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './api';
import type { ProfileCreateResponse, Profile } from '../types/profile';

export function useCreateProfile() {
  return useMutation({
    mutationFn: async (): Promise<ProfileCreateResponse> => {
      const response = await apiClient.post('/profiles');
      return response.data;
    },
  });
}

export function useProfile(feedbackLinkId: string) {
  return useQuery({
    queryKey: ['profile', feedbackLinkId],
    queryFn: async (): Promise<Profile> => {
      const response = await apiClient.get(`/profiles/${feedbackLinkId}`);
      return response.data;
    },
    enabled: !!feedbackLinkId,
  });
}
```

### Feedback Queries (src/services/feedbackQueries.ts)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import type { TraitQuestion, FeedbackSubmission, AggregateResults } from '../types/feedback';

export function useTraits() {
  return useQuery({
    queryKey: ['traits'],
    queryFn: async (): Promise<TraitQuestion[]> => {
      const response = await apiClient.get('/traits');
      return response.data;
    },
  });
}

export function useSubmitFeedback(feedbackLinkId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedback: FeedbackSubmission) => {
      const response = await apiClient.post(
        `/profiles/${feedbackLinkId}/responses`,
        feedback
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate aggregate results to refetch
      queryClient.invalidateQueries({ queryKey: ['aggregate', feedbackLinkId] });
    },
  });
}

export function useAggregateResults(feedbackLinkId: string) {
  return useQuery({
    queryKey: ['aggregate', feedbackLinkId],
    queryFn: async (): Promise<AggregateResults> => {
      const response = await apiClient.get(`/profiles/${feedbackLinkId}/aggregate`);
      return response.data;
    },
    enabled: !!feedbackLinkId,
  });
}
```

---

## Page Components

### CreateProfile Page
```typescript
import { useState } from 'react';
import { useCreateProfile } from '../services/profileQueries';
import Button from '../components/Button';

export default function CreateProfile() {
  const createProfile = useCreateProfile();
  const [result, setResult] = useState<ProfileCreateResponse | null>(null);

  const handleCreate = async () => {
    try {
      const data = await createProfile.mutateAsync();
      setResult(data);
    } catch (error) {
      console.error('Failed to create profile:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show toast notification
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Profile Created!</h1>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h2 className="font-semibold mb-2">Feedback Link (share with colleagues)</h2>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/feedback/${result.feedbackLinkId}`}
              className="flex-1 p-2 border rounded"
            />
            <Button
              onClick={() => copyToClipboard(`${window.location.origin}/feedback/${result.feedbackLinkId}`)}
            >
              Copy
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="font-semibold mb-2">Admin Link (for viewing results)</h2>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/admin/${result.adminLinkId}`}
              className="flex-1 p-2 border rounded"
            />
            <Button
              onClick={() => copyToClipboard(`${window.location.origin}/admin/${result.adminLinkId}`)}
            >
              Copy
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create Manager Profile</h1>
      <p className="mb-6 text-gray-700">
        Get feedback from your colleagues on your leadership mindset.
      </p>
      <Button
        onClick={handleCreate}
        disabled={createProfile.isPending}
        className="w-full"
      >
        {createProfile.isPending ? 'Creating...' : 'Create Profile'}
      </Button>
    </div>
  );
}
```

### FeedbackForm Page
```typescript
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTraits, useSubmitFeedback } from '../services/feedbackQueries';
import TraitRating from '../components/TraitRating';
import Button from '../components/Button';

export default function FeedbackForm() {
  const { feedbackLinkId } = useParams<{ feedbackLinkId: string }>();
  const navigate = useNavigate();

  const { data: traits, isLoading } = useTraits();
  const submitFeedback = useSubmitFeedback(feedbackLinkId!);

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all traits rated
    if (Object.keys(ratings).length !== traits?.length) {
      alert('Please rate all traits');
      return;
    }

    // Get or create respondent ID
    let respondentId = localStorage.getItem('respondentId');
    if (!respondentId) {
      respondentId = `fp_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('respondentId', respondentId);
    }

    const submission = {
      respondentId,
      respondentName: name || undefined,
      traits: Object.entries(ratings).map(([traitId, value]) => ({
        traitId,
        value,
      })),
    };

    try {
      await submitFeedback.mutateAsync(submission);
      navigate(`/success/${feedbackLinkId}`);
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  const allTraitsRated = traits?.every((trait) => ratings[trait.traitId]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Leadership Feedback</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium">Your Name (optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Anonymous"
            className="w-full p-2 border rounded"
          />
        </div>

        {traits?.map((trait) => (
          <TraitRating
            key={trait.traitId}
            trait={trait}
            value={ratings[trait.traitId]}
            onChange={(value) =>
              setRatings((prev) => ({ ...prev, [trait.traitId]: value }))
            }
          />
        ))}

        <Button
          type="submit"
          disabled={!allTraitsRated || submitFeedback.isPending}
          className="w-full"
        >
          {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </form>
    </div>
  );
}
```

---

## Reusable Components

### TraitRating Component
```typescript
import type { TraitQuestion } from '../types/feedback';

interface TraitRatingProps {
  trait: TraitQuestion;
  value?: number;
  onChange: (value: number) => void;
}

export default function TraitRating({ trait, value, onChange }: TraitRatingProps) {
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-2">{trait.label}</h3>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{trait.leftLabel}</span>

        <div className="flex gap-2 flex-1 justify-center">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`
                w-12 h-12 rounded-full border-2 font-semibold
                transition-colors
                ${
                  value === num
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }
              `}
            >
              {num}
            </button>
          ))}
        </div>

        <span className="text-sm text-gray-600">{trait.rightLabel}</span>
      </div>
    </div>
  );
}
```

### RadarChart Component
```typescript
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { AggregateResults, TraitQuestion } from '../types/feedback';

interface RadarChartProps {
  aggregates: AggregateResults;
  traits: TraitQuestion[];
}

export default function RadarChartComponent({ aggregates, traits }: RadarChartProps) {
  // Transform data for Recharts
  const chartData = aggregates.aggregates.map((agg) => {
    const trait = traits.find((t) => t.traitId === agg.traitId);
    return {
      trait: trait?.label || agg.traitId,
      value: agg.average,
    };
  });

  if (aggregates.totalResponses === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No responses yet. Share the feedback link to get started!
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="trait" />
          <PolarRadiusAxis angle={90} domain={[0, 5]} />
          <Radar
            name="Average Rating"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>

      <p className="text-center mt-4 text-gray-600">
        Based on {aggregates.totalResponses} response
        {aggregates.totalResponses !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
```

---

## Routing Setup (React Router)

### App.tsx
```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CreateProfile from './pages/CreateProfile';
import FeedbackForm from './pages/FeedbackForm';
import SuccessScreen from './pages/SuccessScreen';
import ResultsDashboard from './pages/ResultsDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<CreateProfile />} />
          <Route path="/feedback/:feedbackLinkId" element={<FeedbackForm />} />
          <Route path="/success/:feedbackLinkId" element={<SuccessScreen />} />
          <Route path="/admin/:adminLinkId" element={<ResultsDashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
```

---

## Tailwind CSS Configuration

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981',
      },
    },
  },
  plugins: [],
};
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## Testing with React Testing Library

### Component Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TraitRating from '../components/TraitRating';

describe('TraitRating', () => {
  const mockTrait = {
    traitId: 'risk_taking',
    label: 'Takes on risk vs. Risk averse',
    leftLabel: 'Takes on risk',
    rightLabel: 'Risk averse',
    order: 0,
  };

  it('renders trait label', () => {
    render(<TraitRating trait={mockTrait} onChange={() => {}} />);
    expect(screen.getByText('Takes on risk vs. Risk averse')).toBeInTheDocument();
  });

  it('calls onChange when rating selected', () => {
    const handleChange = vi.fn();
    render(<TraitRating trait={mockTrait} onChange={handleChange} />);

    fireEvent.click(screen.getByText('3'));
    expect(handleChange).toHaveBeenCalledWith(3);
  });
});
```

---

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build
npm run preview          # Preview production build
npm test                 # Run tests
npm run lint             # Lint code
```

---

## Common Patterns

### Error Handling
```typescript
if (query.isError) {
  return <ErrorMessage message="Failed to load data" />;
}
```

### Loading States
```typescript
if (query.isLoading) {
  return <div className="animate-pulse">Loading...</div>;
}
```

### Conditional Rendering
```typescript
{data && <Component data={data} />}
{data?.length === 0 && <EmptyState />}
```

---

## Resources

- **React Docs**: https://react.dev/
- **React Query**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/
- **Recharts**: https://recharts.org/
- **React Router**: https://reactrouter.com/

---

## API Contract Reference

See `/specs/001-this-app-is/contracts/api-spec.yaml` for complete API specification.

Ensure TypeScript types match the API contract exactly.

---

**Next Steps**:
1. Run `/tasks` command to generate implementation tasks
2. Build components following TDD approach
3. Test with backend running on `http://localhost:8080`
