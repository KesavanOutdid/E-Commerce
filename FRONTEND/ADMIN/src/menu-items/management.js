// assets
import { IconUsers, IconShield, IconCategory } from '@tabler/icons-react';

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
      breadcrumbs: false
    },
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/users',
      icon: IconUsers,
      breadcrumbs: false
    },
    {
      id: 'categories',
      title: 'Categories',
      type: 'item',
      url: '/categories',
      icon: IconCategory,
      breadcrumbs: false
    },

  ]
};

export default management;
