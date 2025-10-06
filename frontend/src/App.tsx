import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'

// Placeholder components - will be implemented in later tasks
function NameEntry() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Name Entry Page</h1>
        <p className="text-gray-600">Component will be implemented in T031</p>
      </div>
    </div>
  )
}

function Questionnaire() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Questionnaire Page</h1>
        <p className="text-gray-600">Component will be implemented in T032</p>
      </div>
    </div>
  )
}

function ProfileView() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Profile View Page</h1>
        <p className="text-gray-600">Component will be implemented in T034</p>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <NameEntry />,
  },
  {
    path: '/questionnaire',
    element: <Questionnaire />,
  },
  {
    path: '/share/:shareableId',
    element: <ProfileView />,
  },
])

function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  )
}

export default App
