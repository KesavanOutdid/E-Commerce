import PropTypes from 'prop-types';
import React from 'react';
import { 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Avatar,
  Box
} from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';

export default function TopProductsCard({ isLoading, topProducts }) {
  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Typography variant="h4" sx={{ mb: 2 }}>Top Selling Products</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Price/Unit</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topProducts && topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <TableRow hover key={product._id || index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={product.image} 
                              variant="rounded" 
                              sx={{ mr: 2, width: 40, height: 40 }}
                            >
                              {product.productName?.charAt(0)}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {product.productName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          ₹{(product.totalSales / product.quantity).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell align="right">{product.quantity}</TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            ₹{product.totalSales?.toLocaleString('en-IN')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </MainCard>
      )}
    </>
  );
}

TopProductsCard.propTypes = {
  isLoading: PropTypes.bool,
  topProducts: PropTypes.array
};
