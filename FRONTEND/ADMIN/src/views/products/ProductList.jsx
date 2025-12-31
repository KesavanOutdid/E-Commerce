import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Grid,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    Chip,
    Stack,
    CircularProgress,
    Avatar
} from '@mui/material';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useProducts } from '../../hooks/products/useProducts';
import { API_BASE_URL } from '../../config/apiConfig';

const BASE_URL = API_BASE_URL.replace('/api', '');

const ProductList = () => {
    const navigate = useNavigate();
    const {
        products,
        loading,
        pagination,
        filters,
        handlePageChange,
        handleFilterChange,
        fetchProducts,
        deleteProduct
    } = useProducts();

    const [search, setSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleFilterChange('search', search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const getStatusChip = (status) => {
        return (
            <Chip
                label={status ? 'Active' : 'Inactive'}
                size="small"
                sx={{
                    bgcolor: status ? '#e8f5e9' : '#fafafa',
                    color: status ? '#2e7d32' : '#757575',
                    fontWeight: 600,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: status ? '#c8e6c9' : '#eeeeee',
                    textTransform: 'uppercase',
                    fontSize: '0.65rem'
                }}
            />
        );
    };

    const getApprovalChip = (status) => {
        let colors = {
            bg: '#fafafa',
            text: '#757575',
            border: '#eeeeee'
        };

        if (status === 'approved') {
            colors = { bg: '#e8f5e9', text: '#2e7d32', border: '#c8e6c9' };
        } else if (status === 'pending') {
            colors = { bg: '#fff8e1', text: '#f57f17', border: '#ffecb3' };
        } else if (status === 'rejected') {
            colors = { bg: '#ffeede', text: '#d32f2f', border: '#ffcdd2' };
        }

        return (
            <Chip
                label={status || '-'}
                size="small"
                sx={{
                    bgcolor: colors.bg,
                    color: colors.text,
                    fontWeight: 600,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: colors.border,
                    textTransform: 'uppercase',
                    fontSize: '0.65rem'
                }}
            />
        );
    };

    return (
        <MainCard
            title="Products"
            secondary={
                <Button
                    variant="contained"
                    startIcon={<IconPlus />}
                    onClick={() => navigate('/products/add')}
                >
                    Add Product
                </Button>
            }
        >
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconSearch />
                                    </InputAdornment>
                                )
                            }}
                            size="small"
                        />
                    </Grid>
                </Grid>

                <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>Image</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Seller</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Stock</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Approval</TableCell>
                                <TableCell align="center">View</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : products.length > 0 ? (
                                products.map((product) => (
                                    <TableRow key={product._id || product.productId} hover>
                                        <TableCell>
                                            <Avatar
                                                src={product.images && product.images.length > 0 ? `${BASE_URL}${product.images[0]}` : ''}
                                                variant="rounded"
                                                sx={{ width: 50, height: 50 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={500}>
                                                {product.productName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {product.mainCategoryName}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {product.subCategoryName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {product.shopName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">₹{product.price}</TableCell>
                                        <TableCell align="right">{product.stock}</TableCell>
                                        <TableCell align="center">{getStatusChip(product.status)}</TableCell>
                                        <TableCell align="center">{getApprovalChip(product.approvalStatus)}</TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" justifyContent="center" spacing={1}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => navigate(`/products/view/${product.productId || product._id}`)}
                                                >
                                                    <IconEye size={18} />
                                                </IconButton>

                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        No products found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={pagination.totalItems}
                    rowsPerPage={pagination.pageSize}
                    page={pagination.currentPage - 1}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={(e) => {
                        handleFilterChange('limit', e.target.value);
                    }}
                />
            </Box>
        </MainCard>
    );
};

export default ProductList;
