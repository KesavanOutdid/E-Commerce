const MODULES = [
  {
    module: 'Dashboard',
    group: 'General',
    actions: ['view']
  },
  {
    module: 'Roles',
    group: 'User Management',
    actions: ['create', 'view', 'update', 'delete']
  },
  {
    module: 'Users',
    group: 'User Management',
    actions: ['create', 'view', 'update', 'delete']
  },
  {
    module: 'Categories',
    group: 'Product Management',
    actions: ['create', 'view', 'update', 'delete']
  },
  {
    module: 'Products',
    group: 'Product Management',
    actions: ['create', 'view', 'update', 'delete', 'approve']
  },
  {
    module: 'Orders',
    group: 'Order Management',
    actions: ['view', 'update']
  },
  {
    module: 'User Contacts',
    group: 'Contact Management',
    actions: ['view', 'delete']
  },
  {
    module: 'Seller Contacts',
    group: 'Contact Management',
    actions: ['view', 'delete']
  }
];

module.exports = MODULES;
