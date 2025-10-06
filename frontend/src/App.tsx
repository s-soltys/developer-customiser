import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryProvider } from './providers/QueryProvider'
import { NameEntry } from './pages/NameEntry'
import { Questionnaire } from './pages/Questionnaire'
import { Summary } from './pages/Summary'
import { ProfileView } from './pages/ProfileView'

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
    path: '/summary',
    element: <Summary />,
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
