import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/layout/index'
import DashboardPage from '@/pages/dashboard/page'
import ErrorPage from '@/pages/error/page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
])
