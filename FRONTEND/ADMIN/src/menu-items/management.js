// assets
import { IconUsers, IconShield, IconCategory, IconBox } from '@tabler/icons-react';

// ==============================|| MANAGEMENT MENU ITEMS ||============================== //

const management = {
  id: 'management',
  title: 'Management',
  type: 'group',
  children: [
    {
      id: 'roles',
      title: 'Roles',
      type: 'item',
      url: '/roles',
      icon: IconShield,
      breadcrumbs: false,
      module: 'Roles'
    },
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/users',
      icon: IconUsers,
      breadcrumbs: false,
      module: 'Users'
    },
    {
      id: 'categories',
      title: 'Categories',
      type: 'item',
      url: '/categories',
      icon: IconCategory,
      breadcrumbs: false,
      module: 'Categories'
    },
    {
      id: 'products',
      title: 'Products',
      type: 'item',
      url: '/products/list',
      icon: IconBox,
      breadcrumbs: false,
      module: 'Products'
    }
  ]
};

export default management;
