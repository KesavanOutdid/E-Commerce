import PropTypes from 'prop-types';
import React from 'react';
import { CardContent, Grid, Typography, LinearProgress, Box, Tooltip, Chip } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';

export default function TopCategoriesCard({ isLoading, topCategories }) {
  const maxSales = topCategories?.length > 0 ? Math.max(...topCategories.map(c => c.totalSales)) : 0;

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Grid container spacing={gridSpacing}>
              <Grid item xs={12}>
                <Typography variant="h4">Top Categories</Typography>
              </Grid>
              <Grid item xs={12}>
                {topCategories && topCategories.length > 0 ? (
                  topCategories.map((category, index) => {
                    const progress = maxSales > 0 ? (category.totalSales / maxSales) * 100 : 0;
                    return (
                      <React.Fragment key={category._id || index}>
                        <Box sx={{ mb: index < topCategories.length - 1 ? 2.5 : 0 }}>
                          <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Grid item>
                              <Typography variant="subtitle1" color="inherit">
                                {category.categoryName}
                              </Typography>
                            </Grid>
                            <Grid item>
                              <Typography variant="subtitle1" color="inherit">
                                ₹{category.totalSales?.toLocaleString('en-IN')}
                              </Typography>
                            </Grid>
                          </Grid>
                          <Tooltip 
                            title={
                              <Box sx={{ p: 0.5 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                                  Top Products:
                                </Typography>
                                {category.topProducts?.map((p, i) => (
                                  <Typography key={i} variant="caption" sx={{ display: 'block' }}>
                                    • {p.name} (₹{p.sales?.toLocaleString('en-IN')})
                                  </Typography>
                                ))}
                              </Box>
                            }
                            arrow
                          >
                            <Box sx={{ cursor: 'pointer' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={progress} 
                                color="secondary" 
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                          </Tooltip>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" sx={{ color: 'secondary.main' }}>
                              {category.count} items sold
                            </Typography>
                            {category.topProducts?.[0] && (
                              <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'grey.500' }}>
                                Best: {category.topProducts[0].name}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </React.Fragment>
                    );
                  })
                ) : (
                  <Typography variant="body2" sx={{ textAlign: 'center', py: 2 }}>
                    No data available
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </MainCard>
      )}
    </>
  );
}

TopCategoriesCard.propTypes = {
  isLoading: PropTypes.bool,
  topCategories: PropTypes.array
};
