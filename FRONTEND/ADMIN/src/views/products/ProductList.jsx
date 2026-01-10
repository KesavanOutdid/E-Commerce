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
    TableRow,
    TextField,
    Typography,
    Chip,
    Stack,
    CircularProgress,
    Avatar,
    Pagination,
    Tabs,
    Tab,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from '@mui/material';
import { IconSearch, IconPlus, IconEye, IconEdit } from '@tabler/icons-react';
import Swal from 'sweetalert2';

import MainCard from 'ui-component/cards/MainCard';
import { useProducts } from '../../hooks/products/useProducts';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/apiConfig';
import axios from '../../utils/axiosInstance';

const BASE_URL = API_BASE_URL.replace('/api', '');

const ProductAvatar = ({ product }) => {
    const [error, setError] = useState(false);
    
    // Fallback: If master images are empty, try the first variant's images
    let imageList = product.images || [];
    if (imageList.length === 0 && product.variants && product.variants.length > 0) {
        imageList = product.variants[0].images || [];
    }

    const src = (imageList.length === 0 || error) 
        ? 'https://via.placeholder.com/50x50?text=N/A' 
        : `${BASE_URL}${imageList[0]}`;

    return (
        <Avatar
            src={src}
            variant="rounded"
            sx={{ width: 50, height: 50 }}
            imgProps={{
                onError: (e) => {
                    if (error) {
                        e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                        return;
                    }
                    setError(true);
                }
            }}
        />
    );
};

const ProductList = () => {
    const navigate = useNavigate();
    const {
        products,
        loading,
        pagination,
        productType,
        filters,
        handlePageChange,
        handleTypeChange,
        handleFilterChange,
        updateProductApproval
    } = useProducts();

    const [sellers, setSellers] = useState([]);

    useEffect(() => {
        const fetchSellers = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.PRODUCTS.GET_SELLERS_LIST);
                if (response.data.success) {
                    setSellers(response.data.data);
                }
            } catch (error) {
                console.error('Fetch sellers error:', error);
            }
        };
        fetchSellers();
    }, []);

    const handleQuickList = (product) => {
        navigate(`/products/view/${product.productId || product._id}`, { state: { openListDialog: true } });
    };

    const [search, setSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleFilterChange('search', search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, handleFilterChange]);

    const handleApprovalClick = async (product) => {
        const currentStatus = product.approvalStatus || 'pending';
        if (currentStatus !== 'pending') return;

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
        } else if (status === 'pending' || !status) {
            colors = { bg: '#fff3e0', text: '#e65100', border: '#ffe0b2' };
        } else if (status === 'rejected') {
            colors = { bg: '#ffebee', text: '#d32f2f', border: '#ffcdd2' };
        }

        return (
            <Chip
                label={status || 'pending'}
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
                    cursor: (isSellerProduct && (status === 'pending' || !status)) ? 'pointer' : 'default',
                    '&:hover': {
                        bgcolor: (isSellerProduct && (status === 'pending' || !status)) ? colors.border : colors.bg
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
                    <Grid item xs={12} sm={8}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
                            {productType === 'seller' && (
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <InputLabel id="approval-select-label">Approval Status</InputLabel>
                                    <Select
                                        labelId="approval-select-label"
                                        id="approval-select"
                                        value={filters.approvalStatus || ''}
                                        label="Approval Status"
                                        onChange={(e) => handleFilterChange('approvalStatus', e.target.value)}
                                    >
                                        <MenuItem value="">
                                            <em>All Status</em>
                                        </MenuItem>
                                        <MenuItem value="pending">Pending</MenuItem>
                                        <MenuItem value="approved">Approved</MenuItem>
                                        <MenuItem value="rejected">Rejected</MenuItem>
                                    </Select>
                                </FormControl>
                            )}
                            {productType === 'seller' && (
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel id="seller-select-label">Filter by Seller</InputLabel>
                                    <Select
                                        labelId="seller-select-label"
                                        id="seller-select"
                                        value={filters.sellerId || ''}
                                        label="Filter by Seller"
                                        onChange={(e) => handleFilterChange('sellerId', e.target.value)}
                                    >
                                        <MenuItem value="">
                                            <em>All Sellers</em>
                                        </MenuItem>
                                        {sellers.map((seller) => (
                                            <MenuItem key={seller.userId} value={seller.userId}>
                                                {seller.shopName} ({seller.name})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}
                            <Tabs
                                value={productType}
                                onChange={(e, newValue) => handleTypeChange(newValue)}
                                indicatorColor="primary"
                                textColor="primary"
                            >
                                <Tab value="admin" label="Our Products" />
                                <Tab value="seller" label="Seller Products" />
                            </Tabs>
                        </Stack>
                    </Grid>
                </Grid>

                <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ width: '50px' }}>S.No</TableCell>
                                <TableCell>Image</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Seller</TableCell>
                                <TableCell align="right">Pricing</TableCell>
                                <TableCell align="right">Stock</TableCell>
                                <TableCell align="center">Delivery</TableCell>
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
                                products.map((product, index) => (
                                    <TableRow key={product._id || product.productId} hover>
                                        <TableCell sx={{ fontWeight: 500 }}>
                                            {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <ProductAvatar product={product} />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" fontWeight={500}>
                                                {product.productName}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ fontWeight: 600 }}>
                                                {product.variantsCount || (product.variants?.length) || 0} Variants
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
                                                {product.roleId === 1 ? 'Outdid' : (product.shopName || 'Marketplace')}
                                            </Typography>
                                            {product.roleId === 1 && (
                                                <Typography variant="caption" color="textSecondary">
                                                    Admin
                                                </Typography>
                                            )}
                                            {product.roleId === 2 && product.sellerName && (
                                                <Typography variant="caption" color="textSecondary">
                                                    {product.sellerName}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            {(() => {
                                                const minPrice = product.minPriceDetails;
                                                const displayPrice = minPrice?.price || product.price || (product.variants?.[0]?.price);
                                                const displaySalePrice = minPrice?.salePrice || product.salePrice || (product.variants?.[0]?.salePrice);
                                                
                                                if (displaySalePrice && Number(displaySalePrice) > 0) {
                                                    return (
                                                        <Stack alignItems="flex-end">
                                                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.75rem' }}>
                                                                ₹{displayPrice?.toLocaleString('en-IN')}
                                                            </Typography>
                                                            <Typography variant="subtitle2" color="primary.main" fontWeight={600}>
                                                                ₹{displaySalePrice?.toLocaleString('en-IN')}
                                                            </Typography>
                                                        </Stack>
                                                    );
                                                }
                                                return `₹${displayPrice?.toLocaleString('en-IN') || '-'}`;
                                            })()}
                                        </TableCell>
                                        <TableCell align="right">{product.minPriceDetails?.stock ?? (product.stock ?? (product.variants?.[0]?.stock ?? '-'))}</TableCell>
                                        <TableCell align="center">
                                            {(() => {
                                                const days = product.minPriceDetails?.deliveryDays || (product.deliveryDays || (product.variants?.[0]?.deliveryDays));
                                                return days ? `${days} Days` : '-';
                                            })()}
                                        </TableCell>
                                        <TableCell align="center">{getStatusChip(product.status)}</TableCell>
                                        <TableCell align="center">{getApprovalChip(product)}</TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" justifyContent="center" spacing={1}>
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => navigate(`/products/view/${product.productId || product._id}`)}
                                                    title="View"
                                                >
                                                    <IconEye size={18} />
                                                </IconButton>

                                                {product.roleId === 2 && (
                                                    <IconButton
                                                        size="small"
                                                        color="success"
                                                        onClick={() => handleQuickList(product)}
                                                        title="Add to My List"
                                                    >
                                                        <IconPlus size={18} />
                                                    </IconButton>
                                                )}

                                                {product.roleId === 1 && (
                                                    <IconButton
                                                        size="small"
                                                        color="secondary"
                                                        onClick={() => navigate(`/products/edit/${product.productId || product._id}`)}
                                                        title="Edit"
                                                    >
                                                        <IconEdit size={18} />
                                                    </IconButton>
                                                )}
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
