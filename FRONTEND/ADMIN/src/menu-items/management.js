// assets
import { 
  IconUsers, 
  IconShield, 
  IconCategory, 
  IconBox, 
  IconClipboardList, 
  IconMessages,
  IconKey,
  IconUser,
  IconPackage,
  IconListCheck,
  IconMessage2,
  IconMessageDots,
  IconMapPin,
  IconGift,
  IconTicket
} from '@tabler/icons-react';

// ==============================|| MANAGEMENT MENU ITEMS ||============================== //

const management = {
  id: 'management',
  title: 'Management',
  type: 'group',
  children: [
    {
      id: 'user-management',
      title: 'User Management',
      type: 'collapse',
      icon: IconShield,
      children: [
        {
          id: 'roles',
          title: 'Roles',
          type: 'item',
          url: '/roles',
          icon: IconKey,
          breadcrumbs: false,
          module: 'Roles'
        },
        {
          id: 'users',
          title: 'Users',
          type: 'item',
          url: '/users',
          icon: IconUser,
          breadcrumbs: false,
          module: 'Users'
        }
      ]
    },
    {
      id: 'product-management',
      title: 'Product Management',
      type: 'collapse',
      icon: IconBox,
      children: [
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
          icon: IconPackage,
          breadcrumbs: false,
          module: 'Products'
        },
        {
          id: 'pickup-addresses',
          title: 'Pickup Addresses',
          type: 'item',
          url: '/user/pickup-addresses',
          icon: IconMapPin,
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'order-management',
      title: 'Order Management',
      type: 'collapse',
      icon: IconClipboardList,
      children: [
        {
          id: 'orders',
          title: 'Orders',
          type: 'item',
          url: '/orders/list',
          icon: IconListCheck,
          breadcrumbs: false,
          module: 'Orders'
        }
      ]
    },
    {
      id: 'contact-management',
      title: 'Contact Management',
      type: 'collapse',
      icon: IconMessages,
      children: [
        {
          id: 'user-contacts',
          title: 'User Contacts',
          type: 'item',
          url: '/contacts/user',
          icon: IconMessage2,
          breadcrumbs: false,
          module: 'User Contacts'
        },
        {
          id: 'seller-contacts',
          title: 'Seller Contacts',
          type: 'item',
          url: '/contacts/seller',
          icon: IconMessageDots,
          breadcrumbs: false,
          module: 'Seller Contacts'
        }
      ]
    },
    {
      id: 'promotion-management',
      title: 'Promotions',
      type: 'collapse',
      icon: IconGift,
      children: [
        {
          id: 'offers',
          title: 'Offers',
          type: 'item',
          url: '/promotions/offers',
          icon: IconGift,
          breadcrumbs: false
        },
        {
          id: 'coupons',
          title: 'Coupons',
          type: 'item',
          url: '/promotions/coupons',
          icon: IconTicket,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default management;
