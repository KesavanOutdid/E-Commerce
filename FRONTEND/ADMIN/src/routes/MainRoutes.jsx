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

// categories routing
const CategoriesPage = Loadable(lazy(() => import('views/categories')));
const CategoryDetailPage = Loadable(lazy(() => import('views/categories/CategoryDetail')));

// profile routing
const ViewProfilePage = Loadable(lazy(() => import('views/user/ViewProfile')));
const UpdateProfilePage = Loadable(lazy(() => import('views/user/UpdateProfile')));

// products routing
const ProductListPage = Loadable(lazy(() => import('views/products/ProductList')));
const ProductAddPage = Loadable(lazy(() => import('views/products/ProductAdd')));
const ProductDetailPage = Loadable(lazy(() => import('views/products/ProductDetail')));

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
      element: (
        <ProtectedRoute module="Users" action="view">
          <UsersPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'users/:userId',
      element: (
        <ProtectedRoute module="Users" action="view">
          <UserDetailPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'users/edit/:userId',
      element: (
        <ProtectedRoute module="Users" action="update">
          <UserEditPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'roles',
      element: (
        <ProtectedRoute module="Roles" action="view">
          <RolesPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'roles/:roleId',
      element: (
        <ProtectedRoute module="Roles" action="view">
          <RoleDetailPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'categories',
      element: (
        <ProtectedRoute module="Categories" action="view">
          <CategoriesPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'categories/:categoryId',
      element: (
        <ProtectedRoute module="Categories" action="view">
          <CategoryDetailPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'products/list',
      element: (
        <ProtectedRoute module="Products" action="view">
          <ProductListPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'products/add',
      element: (
        <ProtectedRoute module="Products" action="create">
          <ProductAddPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'products/view/:id',
      element: (
        <ProtectedRoute module="Products" action="view">
          <ProductDetailPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'products/edit/:id',
      element: (
        <ProtectedRoute module="Products" action="update">
          <ProductAddPage />
        </ProtectedRoute>
      )
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
