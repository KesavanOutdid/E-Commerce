const MODULES = [
  {
    module: 'Dashboard',
    actions: ['view']
  },
  {
    module: 'Roles',
    actions: ['create', 'view', 'update', 'delete']
  },
  {
    module: 'Users',
    actions: ['create', 'view', 'update', 'delete']
  },
  {
    module: 'Categories',
    actions: ['create', 'view', 'update', 'delete']
  },
  {
    module: 'Products',
    actions: ['create', 'view', 'update', 'delete', 'approve']
  },
  {
    module: 'Orders',
    actions: ['view', 'update']
  },
  {
    module: 'User Contacts',
    actions: ['view', 'delete']
  },
  {
    module: 'Seller Contacts',
    actions: ['view', 'delete']
  },
  
//   {
//     module: 'Reviews',
//     actions: ['view', 'delete']
//   },
//   {
//     module: 'Settings',
//     actions: ['view', 'update']
//   }
];

module.exports = MODULES;
