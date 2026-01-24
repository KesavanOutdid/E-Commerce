import React, { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
    Grid2 as Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { IconArrowLeft, IconEdit, IconTrash, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconTag, IconCurrencyRupee, IconCube, IconCheck, IconX, IconBuildingStore, IconPlus, IconUpload, IconDeviceFloppy } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/apiConfig';
import Swal from 'sweetalert2';
import { useProducts } from '../../hooks/products/useProducts';

const BASE_URL = API_BASE_URL.replace('/api', '');

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { updateProductApproval, addVariant } = useProducts();

    const [product, setProduct] = useState(null);
    const [variants, setVariants] = useState([]);
    const [minPriceVariant, setMinPriceVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState({});

    // Add Variant Dialog State
    const [addVariantDialogOpen, setAddVariantDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'list'
    const [pickupAddresses, setPickupAddresses] = useState([]);
    const [variantFormData, setVariantFormData] = useState({
        price: '',
        salePrice: '',
        stock: '',
        deliveryDays: '3',
        pickupAddress: '',
        attributes: [],
        images: []
    });
    const [variantImages, setVariantImages] = useState([]);
    const [variantPreviewImages, setVariantPreviewImages] = useState([]);

    const fetchPickupAddresses = useCallback(async () => {
        try {
            const response = await axios.get(API_ENDPOINTS.AUTH.PICKUP_ADDRESSES);
            if (response.data.success) {
                setPickupAddresses(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching pickup addresses", error);
        }
    }, []);

    useEffect(() => {
        fetchPickupAddresses();
    }, [fetchPickupAddresses]);

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
                const variantData = productData.variants || [];
                
                // If product has no images, collect from variants
                if (!productData.images || productData.images.length === 0) {
                    const allVariantImages = variantData.reduce((acc, v) => {
                        return [...acc, ...(v.images || [])];
                    }, []);
                    // Remove duplicates
                    productData.images = [...new Set(allVariantImages)];
                }

                setProduct(productData);
                setVariants(variantData);
                // Use the correct field from backend
                setMinPriceVariant(productData.minPriceDetails || response.data.data.minPriceVariant || null);
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

    // Auto-select default pickup address when addresses are loaded and dialog is open
    useEffect(() => {
        if (addVariantDialogOpen && !variantFormData.pickupAddress && pickupAddresses.length > 0) {
            const defaultAddr = pickupAddresses.find(a => a.isDefault)?.id || 
                              pickupAddresses.find(a => a.isDefault)?._id || 
                              pickupAddresses[0]?.id || 
                              pickupAddresses[0]?._id;
            if (defaultAddr) {
                setVariantFormData(prev => ({ ...prev, pickupAddress: defaultAddr }));
            }
        }
    }, [pickupAddresses, addVariantDialogOpen, variantFormData.pickupAddress]);

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

    const handleListProduct = async (variant = null) => {
        setDialogMode('list');
        
        // Handle case where variant is an event or null
        const variantObj = (variant && !variant.nativeEvent && variant.attributes) ? variant : null;
        
        let targetAttributes = [];
        
        // Fetch subcategory attributes instead of pre-loading from variant
        try {
            if (product?.subCategoryId) {
                const response = await axios.get(API_ENDPOINTS.CATEGORIES.GET_SUB_BY_PARENT(product.mainCategoryId));
                if (response.data.success) {
                    const subCategories = response.data.data || [];
                    const currentSub = subCategories.find(s => (s.subCategoryId || s._id) === product.subCategoryId);
                    if (currentSub && currentSub.attributes) {
                        targetAttributes = currentSub.attributes.map(attr => ({
                            attributeId: attr._id || attr.id,
                            name: attr.name,
                            type: attr.type,
                            required: attr.required,
                            value: '' // Keep it empty as requested
                        }));
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching subcategory attributes", error);
        }

        // Fallback to variant attributes if fetch fails or no subcategory attributes, but make values empty
        if (targetAttributes.length === 0) {
            const sourceAttributes = variantObj?.attributes || product?.minPriceDetails?.attributes || product?.attributes || [];
            const safeAttributes = Array.isArray(sourceAttributes) ? sourceAttributes : [];
            targetAttributes = safeAttributes.map(attr => ({ ...attr, value: '' }));
        }

        setVariantFormData({
            price: variantObj?.price || product?.minPriceDetails?.price || product?.price || '',
            salePrice: variantObj?.salePrice || product?.minPriceDetails?.salePrice || product?.salePrice || '',
            stock: '10',
            deliveryDays: '3',
            pickupAddress: pickupAddresses.find(a => a.isDefault)?.id || 
                           pickupAddresses.find(a => a.isDefault)?._id || 
                           pickupAddresses[0]?.id || 
                           pickupAddresses[0]?._id || '',
            attributes: targetAttributes,
            images: []
        });
        setVariantImages([]);
        setVariantPreviewImages([]);
        setAddVariantDialogOpen(true);
    };

    // Auto-open listing dialog if navigated from list with state
    useEffect(() => {
        if (location.state?.openListDialog && product && pickupAddresses.length > 0) {
            handleListProduct();
            // Clear state so it doesn't reopen
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, product, pickupAddresses, navigate, location.pathname]);

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

    const handleOpenAddVariantDialog = async () => {
        setDialogMode('add');
        
        let templateAttributes = [];

        // Try to fetch attributes from subcategory first for a clean add
        try {
            if (product?.subCategoryId) {
                const response = await axios.get(API_ENDPOINTS.CATEGORIES.GET_SUB_BY_PARENT(product.mainCategoryId));
                if (response.data.success) {
                    const subCategories = response.data.data || [];
                    const currentSub = subCategories.find(s => (s.subCategoryId || s._id) === product.subCategoryId);
                    if (currentSub && currentSub.attributes) {
                        templateAttributes = currentSub.attributes.map(attr => ({
                            attributeId: attr._id || attr.id,
                            name: attr.name,
                            type: attr.type,
                            required: attr.required,
                            value: ''
                        }));
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching subcategory attributes for add", error);
        }

        // Fallback to first variant or product attributes if fetch fails
        if (templateAttributes.length === 0) {
            const firstVariantAttributes = (variants && variants.length > 0) ? variants[0].attributes : null;
            templateAttributes = Array.isArray(firstVariantAttributes)
                ? firstVariantAttributes.map(attr => ({ ...attr, value: '' }))
                : (Array.isArray(product?.attributes) ? product.attributes.map(attr => ({ ...attr, value: '' })) : []);
        }

        setVariantFormData({
            price: '',
            salePrice: '',
            stock: '',
            deliveryDays: '3',
            pickupAddress: pickupAddresses.find(a => a.isDefault)?.id || 
                           pickupAddresses.find(a => a.isDefault)?._id || 
                           pickupAddresses[0]?.id || 
                           pickupAddresses[0]?._id || '',
            attributes: templateAttributes,
            images: []
        });
        setVariantImages([]);
        setVariantPreviewImages([]);
        setAddVariantDialogOpen(true);
    };

    const handleVariantFieldChange = (field, value) => {
        setVariantFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleVariantAttributeChange = (index, value) => {
        const updatedAttributes = [...variantFormData.attributes];
        updatedAttributes[index].value = value;
        setVariantFormData(prev => ({ ...prev, attributes: updatedAttributes }));
    };

    const handleVariantImageChange = (e) => {
        const files = Array.from(e.target.files);
        setVariantImages(prev => [...prev, ...files]);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setVariantPreviewImages(prev => [...prev, ...newPreviews]);
    };

    const removeVariantImage = (index) => {
        setVariantImages(prev => prev.filter((_, i) => i !== index));
        setVariantPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveVariant = async () => {
        if (!variantFormData.price || !variantFormData.stock || !variantFormData.pickupAddress) {
            Swal.fire('Error', 'Price, Stock and Pickup Address are required', 'error');
            return;
        }

        // Validate required attributes
        const missingAttributes = variantFormData.attributes.filter(a => a.required && !a.value);
        if (missingAttributes.length > 0) {
            Swal.fire('Error', `Please fill required attributes: ${missingAttributes.map(a => a.name).join(', ')}`, 'error');
            return;
        }

        const formData = new FormData();
        formData.append('price', variantFormData.price);
        formData.append('salePrice', variantFormData.salePrice);
        formData.append('stock', variantFormData.stock);
        formData.append('deliveryDays', variantFormData.deliveryDays);
        formData.append('pickupAddress', variantFormData.pickupAddress);
        formData.append('attributes', JSON.stringify(variantFormData.attributes));
        
        variantImages.forEach((image) => {
            formData.append('images', image);
        });

        const success = await addVariant(product.productId || product._id, formData);
        if (success) {
            setAddVariantDialogOpen(false);
            fetchProduct();
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
                    <Button onClick={() => navigate(-1)} sx={{ minWidth: 0, p: 1, borderRadius: '50%', '&:hover': { bgcolor: 'primary.light' } }}>
                        <IconArrowLeft size={20} />
                    </Button>
                    <Typography variant="h3" fontWeight={700}>{product.productName}</Typography>
                </Stack>
            }
            secondary={
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Chip
                        label={product.status ? 'Active' : 'Inactive'}
                        size="small"
                        sx={{
                            bgcolor: product.status ? '#e3f2fd' : '#fafafa',
                            color: product.status ? '#2196f3' : '#757575',
                            fontWeight: 700,
                            borderRadius: '8px',
                            px: 1,
                            border: '1px solid',
                            borderColor: product.status ? '#90caf9' : '#eeeeee',
                            textTransform: 'uppercase',
                            fontSize: '0.7rem'
                        }}
                    />
                    <Stack direction="row" spacing={1}>
                        {(product.roleId === 1 || (product.variants && product.variants.some(v => v.sellerName === 'Admin'))) ? (
                            <Button
                                variant="contained"
                                startIcon={<IconEdit size={18} />}
                                onClick={() => navigate(`/products/edit/${product.productId || product._id}`)}
                                sx={{ borderRadius: '10px', boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)' }}
                            >
                                Edit Product
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<IconBuildingStore size={18} />}
                                onClick={handleListProduct}
                                sx={{ borderRadius: '10px' }}
                            >
                                Add to My List
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<IconTrash size={18} />}
                            onClick={handleDelete}
                            sx={{ borderRadius: '10px' }}
                        >
                            Delete
                        </Button>
                    </Stack>
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
                                Product Specifications
                            </Typography>
                        </Grid>

                        <Grid size={12}>
                            <DetailRow
                                icon={<IconTag />}
                                label="Brand"
                                value={product.brand}
                            />
                        </Grid>

                        {product.highlights && product.highlights.length > 0 && (
                            <Grid size={12}>
                                <Box sx={{ mt: 1 }}>
                                    <Typography variant="subtitle2" color="secondary" gutterBottom sx={{ fontWeight: 600 }}>
                                        Key Highlights
                                    </Typography>
                                    <Box component="ul" sx={{ mt: 0.5, pl: 2, '& li': { fontSize: '0.9rem', color: 'text.secondary', mb: 1, listStyleType: 'disc' } }}>
                                        {product.highlights.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </Box>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </Grid>

                {/* Full Width Sections */}
                <Grid size={12}>
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" color="secondary" gutterBottom sx={{ fontWeight: 600 }}>
                                Product Description
                            </Typography>
                            <ExpandableText text={product.description} lines={4} />
                        </Box>

                        {product.shortDescription && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="secondary" gutterBottom sx={{ fontWeight: 600 }}>
                                    Summary
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-line' }}>
                                    {product.shortDescription}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>

                {/* Approval Status Banner (for Seller Products) */}
                {product.roleId === 2 && (
                    <Grid size={12}>
                        <Paper 
                            sx={{ 
                                p: 2, 
                                mb: 1, 
                                borderRadius: 2, 
                                border: '1px solid',
                                bgcolor: product.approvalStatus === 'approved' ? '#e8f5e9' : 
                                         product.approvalStatus === 'rejected' ? '#ffebee' : '#fff3e0',
                                borderColor: product.approvalStatus === 'approved' ? '#c8e6c9' : 
                                             product.approvalStatus === 'rejected' ? '#ffcdd2' : '#ffe0b2',
                            }}
                        >
                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box sx={{ 
                                        p: 1, 
                                        bgcolor: product.approvalStatus === 'approved' ? '#2e7d32' : 
                                                 product.approvalStatus === 'rejected' ? '#d32f2f' : '#f57f17',
                                        borderRadius: 1.5,
                                        color: 'white',
                                        display: 'flex'
                                    }}>
                                        {product.approvalStatus === 'approved' ? <IconCheck size={24} /> : 
                                         product.approvalStatus === 'rejected' ? <IconX size={24} /> : <IconTag size={24} />}
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" fontWeight={700} sx={{ 
                                            color: product.approvalStatus === 'approved' ? '#2e7d32' : 
                                                   product.approvalStatus === 'rejected' ? '#d32f2f' : '#e65100',
                                            textTransform: 'uppercase',
                                            letterSpacing: 1
                                        }}>
                                            Approval Status
                                        </Typography>
                                        <Typography variant="h4" sx={{ 
                                            color: product.approvalStatus === 'approved' ? '#1b5e20' : 
                                                   product.approvalStatus === 'rejected' ? '#c62828' : '#bf360c'
                                        }}>
                                            {product.approvalStatus?.toUpperCase() || 'PENDING'}
                                        </Typography>
                                        {product.approvalStatus === 'rejected' && product.rejectionReason && (
                                            <Typography variant="body2" color="error" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                                Reason: {product.rejectionReason}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>

                                {(product.approvalStatus === 'pending' || !product.approvalStatus) && (
                                    <Stack direction="row" spacing={1.5}>
                                        <Button 
                                            variant="contained" 
                                            color="success" 
                                            startIcon={<IconCheck size={18} />}
                                            onClick={() => handleApproval('approved')}
                                            sx={{ borderRadius: 1.5, fontWeight: 600 }}
                                        >
                                            Approve
                                        </Button>
                                        <Button 
                                            variant="contained" 
                                            color="error" 
                                            startIcon={<IconX size={18} />}
                                            onClick={() => handleApproval('rejected')}
                                            sx={{ borderRadius: 1.5, fontWeight: 600 }}
                                        >
                                            Reject
                                        </Button>
                                    </Stack>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                )}



                {/* Marketplace Offers Section */}
                {variants && variants.length > 0 && (
                    <Grid size={12}>
                        <Accordion defaultExpanded elevation={0} sx={{ border: '1px solid #eee', mt: 2 }}>
                            <AccordionSummary expandIcon={<IconChevronDown />}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', pr: 2 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <IconBuildingStore size={20} />
                                        <Typography variant="h4">Marketplace Offers & Variants ({variants.length})</Typography>
                                    </Stack>
                                    {(product.roleId === 1 || product.sellerName === 'Admin') && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            startIcon={<IconPlus size={16} />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenAddVariantDialog();
                                            }}
                                            sx={{ borderRadius: 1.5, textTransform: 'none' }}
                                        >
                                            Add Variant
                                        </Button>
                                    )}
                                </Stack>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 0 }}>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: '#fafafa' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600 }}>Seller / Company</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Specifications / Variant</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Pricing</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Stock</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>Delivery</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600 }}>Promotions</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600 }}>Type</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {variants.map((offer, idx) => (
                                                <TableRow key={idx} hover>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {offer.sellerName || '-'}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary" display="block">
                                                                {offer.shopName || '-'}
                                                            </Typography>
                                                            {offer.pickupAddress && (
                                                                <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 0.5, display: 'block' }}>
                                                                    Pickup: {typeof offer.pickupAddress === 'object' ? 
                                                                        (() => {
                                                                            const addr = offer.pickupAddress;
                                                                            const parts = [
                                                                                addr.name,
                                                                                addr.addressLine1,
                                                                                addr.addressLine2,
                                                                                addr.landmark,
                                                                                addr.city,
                                                                                addr.state
                                                                            ].filter(Boolean);
                                                                            return `${parts.join(', ')} - ${addr.pincode}, ${addr.country || 'India'}`;
                                                                        })() : 
                                                                        offer.pickupAddress}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, maxWidth: 400 }}>
                                                            {offer.attributes?.map((attr, ai) => (
                                                                <Box 
                                                                    key={ai} 
                                                                    sx={{ 
                                                                        display: 'inline-flex', 
                                                                        alignItems: 'center',
                                                                        bgcolor: '#f8f9fa',
                                                                        border: '1px solid #e9ecef',
                                                                        borderRadius: '4px',
                                                                        px: 0.75,
                                                                        py: 0.25
                                                                    }}
                                                                >
                                                                    <Typography 
                                                                        variant="caption" 
                                                                        sx={{ 
                                                                            fontWeight: 700, 
                                                                            color: 'text.secondary', 
                                                                            textTransform: 'uppercase', 
                                                                            fontSize: '0.6rem',
                                                                            mr: 0.5
                                                                        }}
                                                                    >
                                                                        {attr.name}:
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.65rem' }}>
                                                                        {attr.value}
                                                                    </Typography>
                                                                </Box>
                                                            ))}
                                                            {!offer.attributes?.length && <Typography variant="caption" color="textSecondary">Standard</Typography>}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Stack alignItems="flex-end" spacing={0.25}>
                                                            {offer.salePrice && Number(offer.salePrice) > 0 && (
                                                                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                                                    ₹{offer.price?.toLocaleString('en-IN')}
                                                                </Typography>
                                                            )}
                                                            <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                                                                ₹{(offer.salePrice && Number(offer.salePrice) > 0 ? offer.salePrice : offer.price)?.toLocaleString('en-IN')}
                                                            </Typography>

                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography variant="body2" color={offer.stock < 10 ? 'error.main' : 'textPrimary'}>
                                                            {offer.stock}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">{offer.deliveryDays} Days</TableCell>
                                                    <TableCell align="center">
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                                                            {offer.offers?.map((promo, pidx) => (
                                                                <Chip 
                                                                    key={`offer-${pidx}`}
                                                                    label={promo.name}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    icon={<IconTag size={12} />}
                                                                    title={promo.description}
                                                                    sx={{ fontSize: '0.65rem', height: 20 }}
                                                                />
                                                            ))}
                                                            {offer.coupons?.map((coupon, cidx) => (
                                                                <Chip 
                                                                    key={`coupon-${cidx}`}
                                                                    label={coupon.code}
                                                                    size="small"
                                                                    color="secondary"
                                                                    variant="outlined"
                                                                    icon={<IconCurrencyRupee size={12} />}
                                                                    title={`${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} OFF`}
                                                                    sx={{ fontSize: '0.65rem', height: 20 }}
                                                                />
                                                            ))}
                                                            {!offer.offers?.length && !offer.coupons?.length && (
                                                                <Typography variant="caption" color="textSecondary">-</Typography>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip 
                                                            label={offer.isSeller ? 'Marketplace' : 'Primary'} 
                                                            size="small" 
                                                            variant="outlined"
                                                            color={offer.isSeller ? 'primary' : 'secondary'}
                                                            sx={{ fontSize: '0.65rem', height: 20 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        {!offer.isSeller || offer.sellerName === 'Admin' ? (
                                                            <Button
                                                                size="small"
                                                                startIcon={<IconEdit size={14} />}
                                                                onClick={() => navigate(`/products/edit/${product.productId || product._id}`)}
                                                                sx={{ textTransform: 'none', py: 0 }}
                                                            >
                                                                Edit
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="small"
                                                                color="success"
                                                                variant="outlined"
                                                                startIcon={<IconPlus size={14} />}
                                                                onClick={() => handleListProduct(offer)}
                                                                sx={{ textTransform: 'none', py: 0, fontSize: '0.75rem' }}
                                                            >
                                                                Add to List
                                                            </Button>
                                                        )}
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
                            {product.sellerName && (
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
                                <Typography variant="caption" display="block">Main Category</Typography>
                                <Typography variant="body2" fontWeight={500}>{product.mainCategoryName || '-'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Typography variant="caption" display="block">Sub Category</Typography>
                                <Typography variant="body2" fontWeight={500}>{product.subCategoryName || '-'}</Typography>
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
                                                    bgcolor: product.approvalStatus === 'approved' ? '#e8f5e9' : product.approvalStatus === 'rejected' ? '#ffebee' : '#fff3e0',
                                                    color: product.approvalStatus === 'approved' ? '#2e7d32' : product.approvalStatus === 'rejected' ? '#d32f2f' : '#e65100',
                                                    fontWeight: 600,
                                                    borderRadius: '16px',
                                                    border: '1px solid',
                                                    borderColor: product.approvalStatus === 'approved' ? '#c8e6c9' : product.approvalStatus === 'rejected' ? '#ffcdd2' : '#ffe0b2',
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

            {/* Add Variant Dialog */}
            <Dialog 
                open={addVariantDialogOpen} 
                onClose={() => setAddVariantDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        {dialogMode === 'add' ? <IconPlus size={20} color="#2196f3" /> : <IconBuildingStore size={20} color="#2196f3" />}
                        <Typography variant="h3">{dialogMode === 'add' ? 'Add New Variant' : 'List in Our Marketplace'}</Typography>
                    </Stack>
                    <Typography variant="caption" color="textSecondary">
                        {dialogMode === 'add' ? `Create a new configuration for ${product.productName}` : `Adopt this configuration for your listing`}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="MRP (₹)"
                                type="number"
                                value={variantFormData.price}
                                onChange={(e) => handleVariantFieldChange('price', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Price (₹)"
                                type="number"
                                value={variantFormData.salePrice}
                                onChange={(e) => handleVariantFieldChange('salePrice', e.target.value)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Stock"
                                type="number"
                                value={variantFormData.stock}
                                onChange={(e) => handleVariantFieldChange('stock', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Delivery Days"
                                type="number"
                                value={variantFormData.deliveryDays}
                                onChange={(e) => handleVariantFieldChange('deliveryDays', e.target.value)}
                            />
                        </Grid>
                        <Grid size={12}>
                            <FormControl fullWidth>
                                <InputLabel>Pickup Address</InputLabel>
                                <Select
                                    value={variantFormData.pickupAddress}
                                    label="Pickup Address"
                                    onChange={(e) => handleVariantFieldChange('pickupAddress', e.target.value)}
                                >
                                    {pickupAddresses.map((addr) => (
                                        <MenuItem key={addr.id || addr._id} value={addr.id || addr._id}>
                                            {addr.name} - {addr.city}, {addr.pincode} {addr.isDefault ? '(Default)' : ''}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={12}>
                            <Typography variant="subtitle1" sx={{ mb: 1, mt: 1, color: 'primary.main', fontWeight: 600 }}>
                                Variant Attributes
                            </Typography>
                            <Grid container spacing={2}>
                                {variantFormData.attributes.map((attr, idx) => (
                                    <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                                        <TextField
                                            fullWidth
                                            label={attr.name + (attr.required ? ' *' : '')}
                                            value={attr.value}
                                            onChange={(e) => handleVariantAttributeChange(idx, e.target.value)}
                                            placeholder={`Enter ${attr.name}`}
                                            required={attr.required}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        <Grid size={12}>
                            <Typography variant="subtitle1" sx={{ mb: 1, mt: 1, color: 'primary.main', fontWeight: 600 }}>
                                Variant Images
                            </Typography>
                            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                {variantPreviewImages.map((preview, idx) => (
                                    <Box key={idx} sx={{ position: 'relative', width: 100, height: 100 }}>
                                        <img 
                                            src={preview} 
                                            alt={`preview-${idx}`} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} 
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => removeVariantImage(idx)}
                                            sx={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                bgcolor: 'error.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'error.dark' }
                                            }}
                                        >
                                            <IconX size={12} />
                                        </IconButton>
                                    </Box>
                                ))}
                                <Button
                                    component="label"
                                    variant="outlined"
                                    sx={{ width: 100, height: 100, borderRadius: 2, borderStyle: 'dashed' }}
                                >
                                    <Stack alignItems="center">
                                        <IconUpload size={24} />
                                        <Typography variant="caption">Upload</Typography>
                                    </Stack>
                                    <input type="file" hidden multiple accept="image/*" onChange={handleVariantImageChange} />
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, bgcolor: '#fdfdfd' }}>
                    <Button onClick={() => setAddVariantDialogOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSaveVariant} 
                        variant="contained" 
                        color="primary"
                        startIcon={dialogMode === 'add' ? <IconDeviceFloppy size={18} /> : <IconCheck size={18} />}
                    >
                        {dialogMode === 'add' ? 'Save Variant' : 'List Now'}
                    </Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
};

export default ProductDetail;
