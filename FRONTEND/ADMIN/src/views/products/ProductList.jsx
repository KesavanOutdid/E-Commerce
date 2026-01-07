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
    Avatar,
    Pagination
} from '@mui/material';
import { IconSearch, IconPlus, IconEye } from '@tabler/icons-react';
import Swal from 'sweetalert2';

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
        handlePageChange,
        handleFilterChange,
        updateProductApproval
    } = useProducts();

    const [search, setSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleFilterChange('search', search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, handleFilterChange]);

    const handleApprovalClick = async (product) => {
        if (product.approvalStatus !== 'pending') return;

        const result = await Swal.fire({
            title: 'Product Approval',
            text: `What would you like to do with ${product.productName}?`,
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'Approve',
            denyButtonText: 'Reject',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#2e7d32',
            denyButtonColor: '#d32f2f',
        });

        if (result.isConfirmed) {
            await updateProductApproval(product.productId || product._id, 'approved');
        } else if (result.isDenied) {
            const { value: reason } = await Swal.fire({
                title: 'Rejection Reason',
                input: 'textarea',
                inputLabel: 'Please provide a reason for rejection',
                inputPlaceholder: 'Type your reason here...',
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value) {
                        return 'You need to write something!';
                    }
                }
            });

            if (reason) {
                await updateProductApproval(product.productId || product._id, 'rejected', reason);
            }
        }
    };

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

    const getApprovalChip = (product) => {
        const status = product.approvalStatus;
        const isSellerProduct = product.roleId === 2;
        
        if (!isSellerProduct) {
            return (
                <Typography variant="body2" color="textSecondary">
                    -
                </Typography>
            );
        }

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
                label={status || 'PENDING'}
                size="small"
                onClick={() => isSellerProduct && handleApprovalClick(product)}
                sx={{
                    bgcolor: colors.bg,
                    color: colors.text,
                    fontWeight: 600,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: colors.border,
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                    cursor: (isSellerProduct && status === 'pending') ? 'pointer' : 'default',
                    '&:hover': {
                        bgcolor: (isSellerProduct && status === 'pending') ? colors.border : colors.bg
                    }
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
                                                src={product.images && product.images.length > 0 ? `${BASE_URL}${product.images[0]}` : 'https://via.placeholder.com/50x50?text=N/A'}
                                                variant="rounded"
                                                sx={{ width: 50, height: 50 }}
                                                imgProps={{
                                                    onError: (e) => {
                                                        e.target.src = 'https://via.placeholder.com/50x50?text=N/A';
                                                    }
                                                }}
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
                                        <TableCell align="right">
                                            {product.salePrice ? (
                                                <Stack alignItems="flex-end">
                                                    <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.75rem' }}>
                                                        ₹{product.price}
                                                    </Typography>
                                                    <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                                                        ₹{product.salePrice}
                                                    </Typography>
                                                </Stack>
                                            ) : (
                                                `₹${product.price}`
                                            )}
                                        </TableCell>
                                        <TableCell align="right">{product.stock}</TableCell>
                                        <TableCell align="center">{getStatusChip(product.status)}</TableCell>
                                        <TableCell align="center">{getApprovalChip(product)}</TableCell>
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

                <Stack direction="row" justifyContent="center" sx={{ py: 3 }}>
                    <Pagination
                        count={pagination.totalPages}
                        page={pagination.currentPage}
                        onChange={(event, value) => handlePageChange(event, value - 1)}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Stack>
            </Box>
        </MainCard>
    );
};

export default ProductList;
