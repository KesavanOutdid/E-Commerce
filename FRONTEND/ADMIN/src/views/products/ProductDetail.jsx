import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Typography,
    Stack,
    CircularProgress,
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid2 as Grid
} from '@mui/material';
import { IconArrowLeft, IconEdit, IconTrash, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconRuler, IconTag, IconCurrencyRupee, IconCube, IconCheck, IconX, IconBuildingStore } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/apiConfig';
import Swal from 'sweetalert2';
import { useProducts } from '../../hooks/products/useProducts';

const BASE_URL = API_BASE_URL.replace('/api', '');

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { updateProductApproval, listFromCatalog } = useProducts();

    const [product, setProduct] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState({});

    const handleImageError = (index) => {
        setImageErrors((prev) => ({ ...prev, [index]: true }));
    };

    const getImageUrl = (img, index = null) => {
        if (index !== null && imageErrors[index]) {
            return 'https://via.placeholder.com/600x600?text=Photo+N/A';
        }
        if (!img) return 'https://via.placeholder.com/600x600?text=Photo+N/A';
        if (img.startsWith('http')) return img;
        const cleanPath = img.startsWith('/') ? img : `/${img}`;
        return `${BASE_URL}${cleanPath}`;
    };

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
            if (response.data.success) {
                const productData = response.data.data.product;
                setProduct(productData);
                setOffers(productData.allOffers || []);
                setSelectedImageIndex(0);
            }
        } catch (error) {
            console.error("Error fetching product", error);
            Swal.fire('Error', 'Product not found', 'error');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    const handleNextImage = () => {
        if (product?.images?.length) {
            setSelectedImageIndex((prev) => (prev + 1) % product.images.length);
        }
    };

    const handlePrevImage = () => {
        if (product?.images?.length) {
            setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
        }
    };

    const handleApproval = async (status) => {
        let reason = null;
        if (status === 'rejected') {
            const { value: text } = await Swal.fire({
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
            if (text) {
                reason = text;
            } else {
                return;
            }
        } else {
            const result = await Swal.fire({
                title: 'Approve Product?',
                text: "Are you sure you want to approve this product?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#2e7d32',
                confirmButtonText: 'Yes, Approve'
            });
            if (!result.isConfirmed) return;
        }

        const success = await updateProductApproval(product.productId || product._id, status, reason);
        if (success) {
            fetchProduct();
        }
    };

    const handleListProduct = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'List in Our Shop',
            html:
                '<div style="text-align: left; margin-bottom: 10px;">Price (₹)</div>' +
                `<input id="swal-input1" class="swal2-input" type="number" placeholder="Price" value="${product.price}">` +
                '<div style="text-align: left; margin-top: 15px; margin-bottom: 10px;">Sale Price (₹)</div>' +
                `<input id="swal-input2" class="swal2-input" type="number" placeholder="Sale Price" value="${product.salePrice || 0}">` +
                '<div style="text-align: left; margin-top: 15px; margin-bottom: 10px;">Stock</div>' +
                `<input id="swal-input3" class="swal2-input" type="number" placeholder="Stock" value="10">` +
                '<div style="text-align: left; margin-top: 15px; margin-bottom: 10px;">Delivery Days</div>' +
                '<input id="swal-input4" class="swal2-input" type="number" placeholder="Delivery Days" value="3">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'List Now',
            preConfirm: () => {
                return {
                    price: document.getElementById('swal-input1').value,
                    salePrice: document.getElementById('swal-input2').value,
                    stock: document.getElementById('swal-input3').value,
                    deliveryDays: document.getElementById('swal-input4').value
                }
            }
        });

        if (formValues) {
            if (!formValues.price || !formValues.stock) {
                Swal.fire('Error', 'Price and Stock are required', 'error');
                return;
            }

            const success = await listFromCatalog({
                productId: product.productId,
                ...formValues
            });

            if (success) {
                fetchProduct();
            }
        }
    };

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
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go Back</Button>
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

    const ExpandableText = ({ text, lines = 2 }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const [hasOverflow, setHasOverflow] = useState(false);
        const textRef = useRef(null);

        useLayoutEffect(() => {
            if (textRef.current) {
                const element = textRef.current;
                if (!isExpanded) {
                    setHasOverflow(element.scrollHeight > element.offsetHeight);
                }
            }
        }, [text, isExpanded]);

        if (!text) return <Typography variant="body2" color="textSecondary">-</Typography>;

        return (
            <Box>
                <Typography
                    ref={textRef}
                    variant="body2"
                    color="textSecondary"
                    sx={{
                        whiteSpace: 'pre-line',
                        display: '-webkit-box',
                        WebkitLineClamp: isExpanded ? 'unset' : lines,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}
                >
                    {text}
                </Typography>
                {(hasOverflow || isExpanded) && (
                    <Button
                        size="small"
                        onClick={() => setIsExpanded(!isExpanded)}
                        endIcon={isExpanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                        sx={{ mt: 0.5, p: 0, minWidth: 0, textTransform: 'none', fontWeight: 600 }}
                    >
                        {isExpanded ? 'Show Less' : 'Read More'}
                    </Button>
                )}
            </Box>
        );
    };

    return (
        <MainCard
            title={
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 1 }}>
                        <IconArrowLeft />
                    </Button>
                    <Typography variant="h3">{product.productName}</Typography>
                </Stack>
            }
            secondary={
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip
                        label={product.status ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                            bgcolor: product.status ? '#e8f5e9' : '#fafafa',
                            color: product.status ? '#2e7d32' : '#757575',
                            fontWeight: 600,
                            borderRadius: '16px',
                            px: 1,
                            border: '1px solid',
                            borderColor: product.status ? '#c8e6c9' : '#eeeeee',
                            textTransform: 'uppercase',
                            fontSize: '0.65rem',
                            letterSpacing: '0.05rem'
                        }}
                    />
                    {(product.roleId === 1 || (product.marketplaceListings && product.marketplaceListings.some(o => o.sellerName === 'Admin'))) ? (
                        <Button
                            variant="contained"
                            startIcon={<IconEdit />}
                            onClick={() => navigate(`/products/edit/${product.productId || product._id}`)}
                        >
                            Edit Product
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<IconBuildingStore />}
                            onClick={handleListProduct}
                        >
                            Add to My List
                        </Button>
                    )}
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
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack spacing={2}>
                            <Box
                                sx={{
                                    width: '100%',
                                    paddingTop: '100%',
                                    position: 'relative',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border: '1px solid #eee',
                                    backgroundColor: '#f5f5f5',
                                    '&:hover .gallery-arrow': {
                                        opacity: 1
                                    }
                                }}
                            >
                                {(!product.images || product.images.length === 0) ? (
                                    <Stack 
                                        alignItems="center" 
                                        justifyContent="center" 
                                        sx={{ 
                                            position: 'absolute', 
                                            top: 0, 
                                            left: 0, 
                                            width: '100%', 
                                            height: '100%',
                                            bgcolor: '#f0f0f0'
                                        }}
                                    >
                                        <Typography variant="h2" color="textSecondary" sx={{ fontWeight: 700, opacity: 0.5 }}>
                                            PHOTO
                                        </Typography>
                                    </Stack>
                                ) : (
                                    <img
                                        src={getImageUrl(product.images[selectedImageIndex], selectedImageIndex)}
                                        alt={product.productName}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain'
                                        }}
                                        onError={(e) => {
                                            if (imageErrors[selectedImageIndex]) {
                                                // If even placeholder fails, stop loop with transparent pixel
                                                e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                return;
                                            }
                                            handleImageError(selectedImageIndex);
                                        }}
                                    />
                                )}
                                {product.images && product.images.length > 1 && (
                                    <>
                                        <IconButton
                                            className="gallery-arrow"
                                            onClick={handlePrevImage}
                                            sx={{
                                                position: 'absolute',
                                                left: 8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                '&:hover': { bgcolor: 'white' },
                                                opacity: 0,
                                                transition: 'opacity 0.3s',
                                                boxShadow: 2,
                                                zIndex: 10
                                            }}
                                        >
                                            <IconChevronLeft size={20} />
                                        </IconButton>
                                        <IconButton
                                            className="gallery-arrow"
                                            onClick={handleNextImage}
                                            sx={{
                                                position: 'absolute',
                                                right: 8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                '&:hover': { bgcolor: 'white' },
                                                opacity: 0,
                                                transition: 'opacity 0.3s',
                                                boxShadow: 2,
                                                zIndex: 10
                                            }}
                                        >
                                            <IconChevronRight size={20} />
                                        </IconButton>
                                    </>
                                )}
                            </Box>
                            {/* Thumbnails */}
                            {product.images && product.images.length > 1 && (
                                <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1, px: 0.5 }}>
                                    {product.images.map((img, idx) => (
                                        <Box
                                            key={idx}
                                            onClick={() => setSelectedImageIndex(idx)}
                                            sx={{
                                                minWidth: 60,
                                                width: 60,
                                                height: 60,
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                                border: '2px solid',
                                                borderColor: selectedImageIndex === idx ? 'primary.main' : '#ddd',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                backgroundColor: 'white',
                                                '&:hover': { borderColor: 'primary.light' }
                                            }}
                                        >
                                            <img
                                                src={getImageUrl(img, idx)}
                                                alt={`thumbnail-${idx}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    if (imageErrors[idx]) {
                                                        e.target.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                                                        return;
                                                    }
                                                    handleImageError(idx);
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    </Paper>
                </Grid>

                {/* Right Column: Details */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Grid container spacing={3}>
                        <Grid size={12}>
                            <Typography variant="h4" color="primary" sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                                Product Details
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                icon={<IconCurrencyRupee />}
                                label="Price"
                                value={
                                    (product.salePrice && product.salePrice !== product.price) ? (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body1" fontWeight={500} sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.9rem' }}>
                                                ₹{Number(product.price).toLocaleString('en-IN')}
                                            </Typography>
                                            <Typography variant="h4" color="primary" fontWeight={600}>
                                                ₹{Number(product.salePrice).toLocaleString('en-IN')}
                                            </Typography>
                                        </Stack>
                                    ) : (product.price !== product.masterPrice && product.masterPrice) ? (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography variant="body1" fontWeight={500} sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.9rem' }}>
                                                ₹{Number(product.masterPrice).toLocaleString('en-IN')}
                                            </Typography>
                                            <Typography variant="h4" color="primary" fontWeight={600}>
                                                ₹{Number(product.price).toLocaleString('en-IN')}
                                            </Typography>
                                        </Stack>
                                    ) : (
                                        `₹${Number(product.salePrice || product.price).toLocaleString('en-IN')}`
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                icon={<IconCube />}
                                label="Stock"
                                value={product.stock}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                icon={<IconTag />}
                                label="Main Category"
                                value={product.mainCategoryName}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <DetailRow
                                icon={<IconTag />}
                                label="Sub Category"
                                value={product.subCategoryName}
                            />
                        </Grid>

                        <Grid size={12}>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="secondary" gutterBottom>
                                    Description
                                </Typography>
                                <ExpandableText text={product.description} />
                            </Box>
                        </Grid>

                        <Grid size={12}>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" color="secondary" gutterBottom>
                                    Short Description
                                </Typography>
                                <ExpandableText text={product.shortDescription} />
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Minimum Price Highlights */}
                {product.minPriceDetails && (
                    <Grid size={12}>
                        <Paper sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #bbdefb', mb: 1 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ 
                                            p: 1, 
                                            bgcolor: 'primary.light', 
                                            borderRadius: 1.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <IconTag size={24} color="#1e88e5" />
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" fontWeight={600} sx={{ color: 'primary.dark', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                Best Price Offer
                                            </Typography>
                                            <Typography variant="h3" color="primary.main" sx={{ mt: -0.5 }}>
                                                ₹{product.minPrice?.toLocaleString('en-IN')}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            Seller: <strong>{product.minPriceDetails.shopName || product.minPriceDetails.sellerName}</strong>
                                        </Typography>
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            Stock: {product.minPriceDetails.stock} | Delivery: {product.minPriceDetails.deliveryDays} Days
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                )}

                {/* Full Width: Specifications / Attributes */}
                <Grid size={12}>
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

                {/* All Seller Offers */}
                {product.allOffers && product.allOffers.length > 0 && (
                    <Grid size={12}>
                        <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #eee', mt: 2 }}>
                            <AccordionSummary expandIcon={<IconChevronDown />}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <IconTag size={20} />
                                    <Typography variant="h4">All Seller Offers ({product.sellerCount || product.allOffers.length})</Typography>
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: '#fafafa' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600 }}>Seller / Shop</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Stock</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Delivery</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600 }}>Type</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {product.allOffers.map((offer, idx) => (
                                                <TableRow 
                                                    key={idx}
                                                    sx={{ 
                                                        bgcolor: offer.price === product.minPrice ? 'rgba(46, 125, 50, 0.04)' : 'inherit',
                                                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                                                    }}
                                                >
                                                    <TableCell>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {offer.sellerName || '-'}
                                                                    {offer.price === product.minPrice && (
                                                                        <Chip 
                                                                            label="BEST PRICE" 
                                                                            size="small" 
                                                                            color="success" 
                                                                            sx={{ ml: 1, height: 16, fontSize: '0.6rem', fontWeight: 700 }} 
                                                                        />
                                                                    )}
                                                                </Typography>
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {offer.shopName || '-'}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" fontWeight={700} color="primary.main">
                                                            ₹{offer.price?.toLocaleString('en-IN')}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" color={offer.stock < 10 ? 'error.main' : 'textPrimary'}>
                                                            {offer.stock}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">{offer.deliveryDays} Days</TableCell>
                                                    <TableCell align="center">
                                                        <Chip 
                                                            label={offer.isSeller ? 'Marketplace' : 'Primary'} 
                                                            size="small" 
                                                            variant="outlined"
                                                            color={offer.isSeller ? 'primary' : 'secondary'}
                                                            sx={{ fontSize: '0.65rem', height: 20 }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                )}

                {/* Admin Info */}
                <Grid size={12}>
                    <Paper sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                        <Grid container spacing={3}>
                            {product.roleId === 2 && (
                                <>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Typography variant="caption" display="block">Seller Name</Typography>
                                        <Typography variant="body2" fontWeight={500}>{product.sellerName || '-'}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Typography variant="caption" display="block">Shop Name</Typography>
                                        <Typography variant="body2" fontWeight={500}>{product.shopName || '-'}</Typography>
                                    </Grid>
                                </>
                            )}
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="caption" display="block">Created By</Typography>
                                <Typography variant="body2" fontWeight={500}>{product.createdby || '-'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="caption" display="block">Created At</Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {product.createdAt ? new Date(product.createdAt).toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : '-'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="caption" display="block">Updated By</Typography>
                                <Typography variant="body2" fontWeight={500}>{product.updatedby || '-'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="caption" display="block">Updated At</Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {product.updatedAt ? new Date(product.updatedAt).toLocaleString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : '-'}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="caption" display="block">Approval Status</Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    {product.roleId === 2 ? (
                                        <>
                                            <Chip
                                                label={product.approvalStatus || 'PENDING'}
                                                size="small"
                                                sx={{
                                                    mt: 0.5,
                                                    bgcolor: product.approvalStatus === 'approved' ? '#e8f5e9' : product.approvalStatus === 'rejected' ? '#ffebee' : '#fff8e1',
                                                    color: product.approvalStatus === 'approved' ? '#2e7d32' : product.approvalStatus === 'rejected' ? '#d32f2f' : '#f57f17',
                                                    fontWeight: 600,
                                                    borderRadius: '16px',
                                                    border: '1px solid',
                                                    borderColor: product.approvalStatus === 'approved' ? '#c8e6c9' : product.approvalStatus === 'rejected' ? '#ffcdd2' : '#ffecb3',
                                                    textTransform: 'uppercase',
                                                    fontSize: '0.65rem'
                                                }}
                                            />
                                            {product.approvalStatus === 'pending' && (
                                                <>
                                                    <IconButton size="small" color="success" onClick={() => handleApproval('approved')} title="Approve">
                                                        <IconCheck size={16} />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleApproval('rejected')} title="Reject">
                                                        <IconX size={16} />
                                                    </IconButton>
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                            N/A (Admin Product)
                                        </Typography>
                                    )}
                                </Stack>
                            </Grid>
                            {product.approvalStatus === 'rejected' && product.rejectionReason && (
                                <Grid size={12}>
                                    <Typography variant="caption" color="error" display="block">Rejection Reason</Typography>
                                    <Typography variant="body2" color="error" fontWeight={500}>
                                        {product.rejectionReason}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Paper>
                </Grid>

            </Grid>
        </MainCard>
    );
};

export default ProductDetail;
