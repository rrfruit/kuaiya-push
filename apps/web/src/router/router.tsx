import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '@/components/layouts/main-layout'
import DashboardPage from '@/pages/dashboard/page'
import ErrorPage from '@/pages/error/page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
])
