import { createBrowserRouter, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import AcceptInvitePage from '../pages/auth/AcceptInvitePage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import ProjectsListPage from '../pages/project/ProjectsListPage';
import ProjectDetailPage from '../pages/project/ProjectDetailPage';
import SprintBoardPage from '../pages/sprint/SprintBoardPage';
import MyTasksPage from '../pages/task/MyTasksPage';
import MembersPage from '../pages/workspace/MembersPage';
import { ProtectedRoute } from '../components/shared/ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import SettingsPage from '../pages/settings/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/accept-invite', element: <AcceptInvitePage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/projects', element: <ProjectsListPage /> },
          { path: '/projects/:projectId', element: <ProjectDetailPage /> },
          {
            path: '/workspaces/:workspaceId/projects/:projectId/sprints/:sprintId',
            element: <SprintBoardPage />,
          },
          { path: '/my-tasks', element: <MyTasksPage /> },
          { path: '/members', element: <MembersPage /> },
          { path: '/settings', element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);