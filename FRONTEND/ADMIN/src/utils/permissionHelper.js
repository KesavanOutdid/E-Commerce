export const hasPermission = (userPermissions, module, action) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;

  const permission = userPermissions.find(p => p.module === module);
  if (!permission) return false;

  const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
  return !!permission[`can${capitalizedAction}`];
};

export const canView = (userPermissions, module) => hasPermission(userPermissions, module, 'view');
export const canCreate = (userPermissions, module) => hasPermission(userPermissions, module, 'create');
export const canUpdate = (userPermissions, module) => hasPermission(userPermissions, module, 'update');
export const canDelete = (userPermissions, module) => hasPermission(userPermissions, module, 'delete');
export const canApprove = (userPermissions, module) => hasPermission(userPermissions, module, 'approve');
