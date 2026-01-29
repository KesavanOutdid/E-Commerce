import PropTypes from 'prop-types';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

// assets
import { IconBuildingStore, IconPackage, IconAlertTriangle, IconBell } from '@tabler/icons-react';

function ListItemWrapper({ children, onClick, isRead }) {
  const theme = useTheme();

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        bgcolor: isRead ? 'transparent' : alpha(theme.palette.primary.light, 0.2),
        '&:hover': {
          bgcolor: alpha(theme.palette.grey[200], 0.3)
        }
      }}
    >
      {children}
    </Box>
  );
}

ListItemWrapper.propTypes = {
  children: PropTypes.node,
  onClick: PropTypes.func,
  isRead: PropTypes.bool
};

// ==============================|| NOTIFICATION LIST ||============================== //

export default function NotificationList({ notifications = [], markAsRead }) {
  const theme = useTheme();
  const containerSX = { pl: 7 };

  const getIcon = (type) => {
    switch (type) {
      case 'KYC_REQUEST':
        return <IconBuildingStore stroke={1.5} size="20px" />;
      case 'PRODUCT_APPROVAL':
        return <IconPackage stroke={1.5} size="20px" />;
      case 'LOW_STOCK':
        return <IconAlertTriangle stroke={1.5} size="20px" />;
      default:
        return <IconBell stroke={1.5} size="20px" />;
    }
  };

  const getAvatarColor = (type) => {
    switch (type) {
      case 'KYC_REQUEST':
        return { color: 'primary.dark', bgcolor: 'primary.light' };
      case 'PRODUCT_APPROVAL':
        return { color: 'success.dark', bgcolor: 'success.light' };
      case 'LOW_STOCK':
        return { color: 'error.dark', bgcolor: 'error.light' };
      default:
        return { color: 'secondary.dark', bgcolor: 'secondary.light' };
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  if (notifications.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="subtitle2" color="textSecondary">
          No notifications found
        </Typography>
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', maxWidth: { xs: 300, md: 330 }, py: 0 }}>
      {notifications.map((notification) => (
        <ListItemWrapper 
          key={notification._id} 
          isRead={notification.isRead}
          onClick={() => !notification.isRead && markAsRead(notification._id)}
        >
          <ListItem alignItems="center" disablePadding>
            <ListItemAvatar>
              <Avatar sx={getAvatarColor(notification.type)}>
                {getIcon(notification.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText 
              primary={<Typography variant="subtitle1">{notification.title}</Typography>} 
              secondary={
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatTime(notification.createdAt)}
                </Typography>
              }
            />
          </ListItem>
          <Stack spacing={1} sx={containerSX}>
            <Typography variant="subtitle2">{notification.message}</Typography>
            {!notification.isRead && (
              <Chip 
                label="New" 
                color="primary" 
                size="small" 
                sx={{ width: 'min-content', height: 20, fontSize: '0.625rem' }} 
              />
            )}
          </Stack>
        </ListItemWrapper>
      ))}
    </List>
  );
}

NotificationList.propTypes = {
  notifications: PropTypes.array,
  markAsRead: PropTypes.func
};
