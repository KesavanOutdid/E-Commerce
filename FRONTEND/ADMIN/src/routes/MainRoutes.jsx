import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ProtectedRoute from 'components/ProtectedRoute';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// users & roles routing
const UsersPage = Loadable(lazy(() => import('views/users')));
const UserDetailPage = Loadable(lazy(() => import('views/users/UserDetail')));
const UserEditPage = Loadable(lazy(() => import('views/users/UserEdit')));
const RolesPage = Loadable(lazy(() => import('views/roles')));
const RoleDetailPage = Loadable(lazy(() => import('views/roles/RoleDetail')));

// profile routing
const ViewProfilePage = Loadable(lazy(() => import('views/user/ViewProfile')));
const UpdateProfilePage = Loadable(lazy(() => import('views/user/UpdateProfile')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'users',
      element: <UsersPage />
    },
    {
      path: 'users/:userId',
      element: <UserDetailPage />
    },
    {
      path: 'users/edit/:userId',
      element: <UserEditPage />
    },
    {
      path: 'roles',
      element: <RolesPage />
    },
    {
      path: 'roles/:roleId',
      element: <RoleDetailPage />
    },
    {
      path: 'user/view-profile',
      element: <ViewProfilePage />
    },
    {
      path: 'user/update-profile',
      element: <UpdateProfilePage />
    }
  ]
};

export default MainRoutes;
