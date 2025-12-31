import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Grid,
    Typography,
    Stack,
    CircularProgress,
    Chip,
    Divider,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid2
} from '@mui/material';
import { IconArrowLeft, IconEdit, IconTrash, IconChevronDown, IconRuler, IconTag, IconCurrencyRupee, IconCube } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/apiConfig';
import Swal from 'sweetalert2';
import { useProducts } from '../../hooks/products/useProducts';

const BASE_URL = API_BASE_URL.replace('/api', '');

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { deleteProduct } = useProducts();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainCategoryName, setMainCategoryName] = useState('');
    const [subCategoryName, setSubCategoryName] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
                if (response.data.success) {
                    const productData = response.data.data;
                    setProduct(productData);

                    // Fetch Category Names if ids exist
                    // Assuming we have to fetch them or if they are embedded. 
                    // Usually product data might only have IDs. 
                    // To show names we might need to fetch categories (or cached).
                    // For now we will display IDs if names not available, or just fetch them if we want to be perfect.
                    // Let's see if we can get them from the general category list which might be heavy, 
                    // or just leave as is for now until requested.
                }
            } catch (error) {
                console.error("Error fetching product", error);
                Swal.fire('Error', 'Product not found', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
                if (response.data.success) {
                    Swal.fire('Deleted!', 'Product has been deleted.', 'success');
                    navigate('/products/list');
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete product', 'error');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!product) {
        return (
            <MainCard>
                <Typography variant="h3">Product not found</Typography>
                <Button onClick={() => navigate('/products/list')} sx={{ mt: 2 }}>Back to List</Button>
            </MainCard>
        );
    }

    // Detail Row Component
    const DetailRow = ({ icon, label, value }) => (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
            <Box>
                <Typography variant="caption" color="textSecondary" display="block">
                    {label}
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                    {value || '-'}
                </Typography>
            </Box>
        </Stack>
    );

    return (
        <MainCard
            title={
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Button onClick={() => navigate('/products/list')} sx={{ minWidth: 0, p: 1 }}>
                        <IconArrowLeft />
                    </Button>
                    <Typography variant="h3">{product.productName}</Typography>
                    <Chip
                        label={product.status ? 'Active' : 'Inactive'}
                        color={product.status ? 'success' : 'default'}
                        size="small"
                        sx={{ ml: 2 }}
                    />
                </Stack>
            }
            secondary={
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        startIcon={<IconEdit />}
                        onClick={() => navigate(`/products/edit/${product._id || product.productId}`)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<IconTrash />}
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </Stack>
            }
        >
            <Grid container spacing={3}>
                {/* Left Column: Images */}
                <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    width: '100%',
                                    paddingTop: '100%',
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '1px solid #eee'
                                }}
                            >
                                <img
                                    src={product.images && product.images.length > 0 ? `${BASE_URL}${product.images[0]}` : 'https://via.placeholder.com/300'}
                                    alt={product.productName}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </Box>
                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
                                    {product.images.map((img, idx) => (
                                        <Box key={idx} sx={{ minWidth: 60, width: 60, height: 60, borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
                                            <img
                                                src={`${BASE_URL}${img}`}
                                                alt={`thumbnail-${idx}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Right Column: Details */}
                <Grid item xs={12} md={8}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h4" color="primary" sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                                Product Details
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <DetailRow
                                icon={<IconCurrencyRupee />}
                                label="Price"
                                value={`₹${product.price}`}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DetailRow
                                icon={<IconCube />}
                                label="Stock"
                                value={product.stock}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DetailRow
                                icon={<IconTag />}
                                label="Main Category ID"
                                value={product.mainCategoryId}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <DetailRow
                                icon={<IconTag />}
                                label="Sub Category ID"
                                value={product.subCategoryId}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="secondary" gutterBottom>
                                    Description
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-line' }}>
                                    {product.description || 'No description available.'}
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="secondary" gutterBottom>
                                    Short Description
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {product.shortDescription || '-'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Full Width: Specifications / Attributes */}
                <Grid item xs={12}>
                    <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #eee' }}>
                        <AccordionSummary expandIcon={<IconChevronDown />}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <IconRuler size={20} />
                                <Typography variant="h4">Specifications</Typography>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            {product.attributes && product.attributes.length > 0 ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableBody>
                                            {product.attributes.map((attr, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell sx={{ fontWeight: 'bold', width: '30%', color: 'text.secondary' }}>
                                                        {attr.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {attr.value}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography color="textSecondary">No specific attributes defined.</Typography>
                            )}
                        </AccordionDetails>
                    </Accordion>
                </Grid>

                {/* Admin Info */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" display="block">Created By</Typography>
                                <Typography variant="body2">{product.createdby || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" display="block">Updated By</Typography>
                                <Typography variant="body2">{product.updatedby || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" display="block">Slug</Typography>
                                <Typography variant="body2">{product.slug}</Typography>
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <Typography variant="caption" display="block">Approval</Typography>
                                <Chip
                                    label={product.approvalStatus || 'N/A'}
                                    size="small"
                                    variant="outlined"
                                    color={product.approvalStatus === 'approved' ? 'success' : product.approvalStatus === 'rejected' ? 'error' : 'warning'}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

            </Grid>
        </MainCard>
    );
};

export default ProductDetail;
