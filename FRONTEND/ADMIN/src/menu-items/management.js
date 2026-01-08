// assets
import { IconUsers, IconShield, IconCategory, IconBox, IconClipboardList, IconMessages } from '@tabler/icons-react';

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
    },
    {
      id: 'orders',
      title: 'Orders',
      type: 'item',
      url: '/orders/list',
      icon: IconClipboardList,
      breadcrumbs: false,
      module: 'Orders'
    },
    {
      id: 'contacts',
      title: 'Contacts',
      type: 'collapse',
      icon: IconMessages,
      children: [
        {
          id: 'user-contacts',
          title: 'User Contacts',
          type: 'item',
          url: '/contacts/user',
          breadcrumbs: false,
          module: 'User Contacts'
        },
        {
          id: 'seller-contacts',
          title: 'Seller Contacts',
          type: 'item',
          url: '/contacts/seller',
          breadcrumbs: false,
          module: 'Seller Contacts'
        }
      ]
    }
  ]
};

export default management;
