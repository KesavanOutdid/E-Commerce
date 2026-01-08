import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { 
  Avatar, 
  CardContent, 
  Divider, 
  Grid, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Box 
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';

export default function PopularCard({ isLoading, bestSellers }) {
  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>Top Sellers</Typography>
            <List disablePadding>
              {bestSellers && bestSellers.length > 0 ? (
                bestSellers.map((seller, index) => (
                  <React.Fragment key={seller._id || index}>
                    <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main' }}>
                          <StorefrontTwoToneIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">{seller.shopName || seller.sellerName}</Typography>
                            <Typography variant="subtitle1">₹{seller.totalSales?.toLocaleString('en-IN')}</Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" sx={{ color: 'primary.main' }}>
                            {seller.orderCount} successful orders
                          </Typography>
                        }
                      />
                    </ListItem>
                    {index < bestSellers.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
                  No data available for this period
                </Typography>
              )}
            </List>
          </CardContent>
        </MainCard>
      )}
    </>
  );
}

PopularCard.propTypes = {
  isLoading: PropTypes.bool,
  bestSellers: PropTypes.array
};
