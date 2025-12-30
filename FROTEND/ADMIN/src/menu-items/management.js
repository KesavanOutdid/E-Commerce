// assets
import { IconUsers, IconShield } from '@tabler/icons-react';

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
    
  ]
};

export default management;
