import { memo, useState } from 'react';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItems from 'menu-items';

import { useGetMenuMaster } from 'api/menu';
import { useAuth } from 'contexts/AuthContext';
import { canView } from 'utils/permissionHelper';

// ==============================|| SIDEBAR MENU LIST ||============================== //

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const { user } = useAuth();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [selectedID, setSelectedID] = useState('');

  const lastItem = null;

  // Filter menu items based on permissions
  const filteredMenuItems = {
    items: menuItems.items.map((group) => {
      const filteredChildren = group.children?.filter((item) => {
        if (!item.module) return true; // Show items without module restriction
        return canView(user?.permissions, item.module);
      });

      return { ...group, children: filteredChildren };
    }).filter(group => group.children && group.children.length > 0)
  };

  let lastItemIndex = filteredMenuItems.items.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < filteredMenuItems.items.length) {
    lastItemId = filteredMenuItems.items[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = filteredMenuItems.items.slice(lastItem - 1, filteredMenuItems.items.length).map((item) => ({
      title: item.title,
      elements: item.children,
      icon: item.icon,
      ...(item.url && {
        url: item.url
      })
    }));
  }

  const navItems = filteredMenuItems.items.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem item={item} level={1} isParents setSelectedID={() => setSelectedID('')} />
              {index !== 0 && <Divider sx={{ py: 0.5 }} />}
            </List>
          );
        }

        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
