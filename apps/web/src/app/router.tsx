import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/components/layouts/main-layout";
import ErrorPage from "@/pages/error/page";
import DashboardPage from "@/pages/dashboard/page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
]);

