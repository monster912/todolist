import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { TodoCreatePage } from '@/pages/TodoCreatePage'
import { TodoEditPage } from '@/pages/TodoEditPage'
import { TodoDetailPage } from '@/pages/TodoDetailPage'
import { CategoryPage } from '@/pages/CategoryPage'
import { SettingsPage } from '@/pages/SettingsPage'

function PrivateRoute() {
  const token = useAuthStore((s) => s.token)
  return token ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicRoute() {
  const token = useAuthStore((s) => s.token)
  return token ? <Navigate to="/" replace /> : <Outlet />
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <PrivateRoute />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/todos/new', element: <TodoCreatePage /> },
      { path: '/todos/:id/edit', element: <TodoEditPage /> },
      { path: '/todos/:id', element: <TodoDetailPage /> },
      { path: '/categories', element: <CategoryPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
