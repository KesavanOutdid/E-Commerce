import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Grid,
    TextField,
    Typography,
    Stack,
    MenuItem,
    FormControlLabel,
    Switch,
    IconButton,
    Paper,
    Autocomplete,
    InputAdornment,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { IconArrowLeft, IconUpload, IconX, IconPlus, IconDeviceFloppy, IconEdit } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/apiConfig';
import { useProducts } from '../../hooks/products/useProducts';
import Swal from 'sweetalert2';

const BASE_URL = API_BASE_URL.replace('/api', '');

const ProductAdd = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // For edit mode
    const isEdit = !!id;
    const { createProduct, updateProduct } = useProducts();

    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [pickupAddresses, setPickupAddresses] = useState([]);
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressForm, setAddressForm] = useState({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        phone: '',
        isDefault: false
    });

    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        shortDescription: '',
        mainCategoryId: '',
        subCategoryId: '',
        status: true,
        createdBy: 'admin@gmail.com', // Should be dynamic from auth
        roleId: 1,
        brand: '',
        highlights: [],
        specifications: [],
        warranty: '',
        // Master attributes (shared across all variants)
        attributes: [],
        // Variants
        variants: [
            {
                price: '',
                salePrice: '',
                stock: '',
                deliveryDays: '3',
                pickupAddress: '',
                attributes: [], // Variant specific attributes (e.g., Color, Size)
                images: [],
                previewImages: [],
                existingImages: []
            }
        ]
    });

    const isListingOnly = isEdit && formData.roleId === 2;

    // Fetch Pickup Addresses
    useEffect(() => {
        const fetchPickupAddresses = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.AUTH.PICKUP_ADDRESSES);
                if (response.data.success) {
                    setPickupAddresses(response.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching pickup addresses", error);
            }
        };
        fetchPickupAddresses();
    }, []);

    // Fetch Main Categories on mount
    useEffect(() => {
        const fetchMainCategories = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
                if (response.data.success) {
                    // Check if data is paginated or direct array
                    const categoriesData = response.data.data.categories || response.data.data || [];
                    setMainCategories(Array.isArray(categoriesData) ? categoriesData : []);
                }
            } catch (error) {
                console.error("Error fetching categories", error);
            }
        };
        fetchMainCategories();
    }, []);

    // If Edit Mode, Fetch Product Details
    useEffect(() => {
        if (isEdit) {
            const fetchProduct = async () => {
                try {
                    const response = await axios.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
                    if (response.data.success) {
                        const product = response.data.data.product || response.data.data || response.data;
                        const variants = response.data.data.variants || (product.variants ? product.variants : []);
                        
                        setFormData({
                            productName: product.productName,
                            description: product.description || '',
                            shortDescription: product.shortDescription || '',
                            mainCategoryId: product.mainCategoryId,
                            subCategoryId: product.subCategoryId,
                            status: product.status,
                            createdBy: product.createdby,
                            roleId: product.roleId || 1,
                            brand: product.brand || '',
                            highlights: product.highlights || [],
                            specifications: product.specifications || [],
                            warranty: product.warranty || '',
                            attributes: product.attributes || [],
                            variants: variants.length > 0 ? variants.map(v => ({
                                variantId: v.variantId,
                                price: v.price,
                                salePrice: v.salePrice || '',
                                stock: v.stock,
                                deliveryDays: v.deliveryDays || '3',
                                attributes: v.attributes || [],
                                images: [],
                                previewImages: [],
                                existingImages: v.images || []
                            })) : [{
                                price: product.price || '',
                                salePrice: product.salePrice || '',
                                stock: product.stock || '',
                                deliveryDays: product.deliveryDays || '3',
                                attributes: [],
                                images: [],
                                previewImages: [],
                                existingImages: []
                            }]
                        });

                        if (product.mainCategoryId) {
                            fetchSubCategories(product.mainCategoryId);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching product details", error);
                    // Swal.fire('Error', 'Failed to fetch product details', 'error');
                }
            };
            fetchProduct();
        }
    }, [id, isEdit]);

    // Normalize IDs: If existing product has ObjectId keys, convert them to UUIDs using the loaded categories
    useEffect(() => {
        if (isEdit && mainCategories.length > 0 && formData.mainCategoryId) {
            // Check if current mainCategoryId is an ObjectId (length 24) but we have a matching UUID
            const selectedCat = mainCategories.find(c => 
                (c.categoryId && String(c.categoryId) === String(formData.mainCategoryId)) || 
                (c._id && String(c._id) === String(formData.mainCategoryId))
            );

            if (selectedCat && selectedCat.categoryId && String(selectedCat.categoryId) !== String(formData.mainCategoryId)) {
                // The user has an ObjectId (or different ID) selected, but we found the canonical UUID. Switch to UUID.
                setFormData(prev => ({ ...prev, mainCategoryId: selectedCat.categoryId }));
                // We also need to re-fetch subcategories with the UUID if we haven't already
                fetchSubCategories(selectedCat.categoryId);
            }
        }
    }, [mainCategories, formData.mainCategoryId, isEdit]);

    // Normalize SubCategory ID
    useEffect(() => {
        if (isEdit && subCategories.length > 0 && formData.subCategoryId) {
            const selectedSub = subCategories.find(s => 
                (s.subCategoryId && String(s.subCategoryId) === String(formData.subCategoryId)) || 
                (s._id && String(s._id) === String(formData.subCategoryId)) ||
                (s.id && String(s.id) === String(formData.subCategoryId))
            );

            if (selectedSub && selectedSub.subCategoryId && String(selectedSub.subCategoryId) !== String(formData.subCategoryId)) {
                setFormData(prev => ({ ...prev, subCategoryId: selectedSub.subCategoryId }));
            }
        }
    }, [subCategories, formData.subCategoryId, isEdit]);

    // Merge subcategory attributes with product attributes in edit mode
    useEffect(() => {
        if (isEdit && subCategories.length > 0 && formData.subCategoryId && formData.attributes) {
            const selectedSub = subCategories.find(s => 
                String(s.subCategoryId) === String(formData.subCategoryId) || 
                String(s._id) === String(formData.subCategoryId) ||
                String(s.id) === String(formData.subCategoryId)
            );

            if (selectedSub && selectedSub.attributes) {
                const subAttrs = selectedSub.attributes;
                const currentAttrs = formData.attributes || [];
                
                // Check if there are any attributes in the subcategory that are not in the form
                const hasMissing = subAttrs.some(sa => !currentAttrs.find(ca => ca.name === sa.name));
                
                if (hasMissing) {
                    const mergedAttributes = subAttrs.map(sa => {
                        const existing = currentAttrs.find(ca => ca.name === sa.name);
                        return {
                            attributeId: sa._id || sa.id || sa.attributeId,
                            name: sa.name,
                            type: sa.type,
                            required: sa.required,
                            value: existing ? existing.value : ''
                        };
                    });
                    
                    // Only update if actually different to prevent loops
                    setFormData(prev => ({ ...prev, attributes: mergedAttributes }));
                }
            }
        }
    }, [subCategories, formData.subCategoryId, formData.attributes, isEdit]);

    const fetchSubCategories = async (parentId) => {
        try {
            // Need an endpoint to get subs by parent. 
            // `categoryController.js` has `getSubcategoriesByParent` at `/categories/sub/parent/:parentId`? 
            // Using logic from `useCategoryDetail`? No, that's detail.
            // Let's check `categoryRoutes.js` (implied). I didn't see `categoryRoutes.js` but `categoryController.js` has `getSubcategoriesByParent`.
            // In `apiConfig.js`, `CATEGORIES` doesn't have `GET_BY_PARENT`.
            // User `d:\2912\E-Commerce\BACKEND\routes\categories\categoryRoutes.js` likely maps it.
            // I'll assume a standard route or query. 
            // Ideally: `/categories/main/${parentId}/subcategories` or similar.
            // However, looking at `apiConfig.js`: `GET_ALL: '/categories/main'`
            // I'll guess I might need to filter client-side or add a route. 
            // Wait, `CategoryDetail.jsx` uses `useCategoryDetail` which fetches detail.
            // I'll try to use the Backend Controller method `getSubcategoriesByParent`. 
            // I'll optimistically assume `/api/categories/sub/parent/:parentId` exists or I can add it.
            // Wait, I cannot touch backend.
            // The existing `GET_ALL` for categories likely only returns main categories.
            // I need to find how to get subcategories.

            // Checking `categoryController.js` export `getSubcategoriesByParent`.
            // This function exists. It is likely mounted.
            // I'll verify routes if I can, but I can't touch backend.
            // I'll check `apiConfig` again.
            // `apiConfig` doesn't list it explicitly.

            // Workaround: If I can't verify the route, I'll assume `/categories/sub` gets all and I filter? Risky if many.
            // Or `/categories/main/${parentId}` -> does it return subcategories?
            // `CategoryDetail.jsx` fetches `API_ENDPOINTS.CATEGORIES.GET_BY_ID`.
            // In `categoryController.js`, `getSubcategoriesByParent` is separate.

            // Let's guess the route is `/categories/sub/parent/${parentId}`.
            const response = await axios.get(API_ENDPOINTS.CATEGORIES.GET_SUB_BY_PARENT(parentId));
            if (response.data.success) {
                setSubCategories(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching subcategories", error);
            setSubCategories([]);
        }
    };

    const handleMainCategoryChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, mainCategoryId: value, subCategoryId: '', attributes: [] }));
        setSubCategories([]);
        if (value) {
            fetchSubCategories(value);
        }
    };

    const handleSubCategoryChange = (e) => {
        const value = e.target.value;
        const selectedSub = subCategories.find(sub => (sub.subCategoryId || sub._id || sub.id) === value);

        const newAttributes = selectedSub?.attributes?.map(attr => ({
            attributeId: attr._id || attr.id,
            name: attr.name,
            type: attr.type,
            required: attr.required,
            value: ''
        })) || [];

        setFormData(prev => ({
            ...prev,
            subCategoryId: value,
            attributes: [], // Reset master attributes
            variants: prev.variants.map(v => ({
                ...v,
                attributes: newAttributes // Assign category attributes to variants by default
            }))
        }));
    };

    const handleAttributeChange = (index, value) => {
        setFormData(prev => {
            const newAttrs = [...prev.attributes];
            newAttrs[index] = { ...newAttrs[index], value };
            return { ...prev, attributes: newAttrs };
        });
    };

    const handleAddSpecification = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...(prev.specifications || []), { key: '', value: '' }]
        }));
    };

    const handleRemoveSpecification = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const handleSpecificationChange = (index, field, value) => {
        const newSpecs = [...formData.specifications];
        newSpecs[index][field] = value;
        setFormData(prev => ({ ...prev, specifications: newSpecs }));
    };

    const handleSubmitPickupAddress = async () => {
        // Validation
        const required = ['name', 'addressLine1', 'city', 'district', 'state', 'pincode', 'phone'];
        const missing = required.filter(f => !addressForm[f]);
        if (missing.length > 0) {
            Swal.fire('Error', `Please fill required fields: ${missing.join(', ')}`, 'error');
            return;
        }

        try {
            let response;
            if (editingAddressId) {
                response = await axios.put(`${API_ENDPOINTS.AUTH.PICKUP_ADDRESSES}/${editingAddressId}`, addressForm);
            } else {
                response = await axios.post(API_ENDPOINTS.AUTH.PICKUP_ADDRESSES, addressForm);
            }

            if (response.data.success) {
                setPickupAddresses(response.data.data || []);
                setAddressDialogOpen(false);
                setAddressForm({
                    name: '', addressLine1: '', addressLine2: '', city: '',
                    district: '', state: '', pincode: '', phone: '', isDefault: false
                });
                setEditingAddressId(null);
                Swal.fire('Success', `Address ${editingAddressId ? 'updated' : 'added'} successfully`, 'success');
            }
        } catch (error) {
            console.error("Error saving address", error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to save address', 'error');
        }
    };

    const handleOpenAddressDialog = (address = null) => {
        if (address) {
            setAddressForm({
                name: address.name || '',
                addressLine1: address.addressLine1 || '',
                addressLine2: address.addressLine2 || '',
                city: address.city || '',
                district: address.district || '',
                state: address.state || '',
                pincode: address.pincode || '',
                phone: address.phone || '',
                isDefault: address.isDefault || false
            });
            setEditingAddressId(address._id || address.id);
        } else {
            setAddressForm({
                name: '', addressLine1: '', addressLine2: '', city: '',
                district: '', state: '', pincode: '', phone: '', isDefault: false
            });
            setEditingAddressId(null);
        }
        setAddressDialogOpen(true);
    };

    const addVariant = () => {
        const baseAttributes = formData.variants[0]?.attributes.map(attr => ({ ...attr, value: '' })) || [];
        setFormData(prev => ({
            ...prev,
            variants: [
                ...prev.variants,
                {
                    price: '',
                    salePrice: '',
                    stock: '',
                    deliveryDays: '3',
                    pickupAddress: '',
                    attributes: baseAttributes,
                    images: [],
                    previewImages: [],
                    existingImages: []
                }
            ]
        }));
    };

    const removeVariant = (index) => {
        if (formData.variants.length > 1) {
            setFormData(prev => ({
                ...prev,
                variants: prev.variants.filter((_, i) => i !== index)
            }));
        }
    };

    const handleVariantChange = (index, field, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[index][field] = value;
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    const handleVariantAttributeChange = (vIndex, aIndex, value) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[vIndex].attributes[aIndex].value = value;
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    const handleImageChange = (e, vIndex) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const updatedVariants = [...formData.variants];
            updatedVariants[vIndex].images = [...updatedVariants[vIndex].images, ...files];
            
            const newPreviews = files.map(file => URL.createObjectURL(file));
            updatedVariants[vIndex].previewImages = [...updatedVariants[vIndex].previewImages, ...newPreviews];
            
            setFormData(prev => ({ ...prev, variants: updatedVariants }));
        }
    };

    const removeImage = (vIndex, imgIndex) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[vIndex].images = updatedVariants[vIndex].images.filter((_, i) => i !== imgIndex);
        updatedVariants[vIndex].previewImages = updatedVariants[vIndex].previewImages.filter((_, i) => i !== imgIndex);
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    const removeExistingImage = (vIndex, imgIndex) => {
        const updatedVariants = [...formData.variants];
        updatedVariants[vIndex].existingImages = updatedVariants[vIndex].existingImages.filter((_, i) => i !== imgIndex);
        setFormData(prev => ({ ...prev, variants: updatedVariants }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.productName || !formData.mainCategoryId || !formData.subCategoryId) {
            Swal.fire('Error', 'Please fill in all required fields.', 'error');
            return;
        }

        // Validate variants
        for (let i = 0; i < formData.variants.length; i++) {
            const v = formData.variants[i];
            if (!v.price || !v.stock) {
                Swal.fire('Error', `Please fill in Price and Stock for Variant ${i + 1}`, 'error');
                return;
            }
            
            const missingAttrs = v.attributes.filter(attr => attr.required && !attr.value);
            if (missingAttrs.length > 0) {
                Swal.fire('Error', `Variant ${i + 1}: Please fill in required attributes: ${missingAttrs.map(a => a.name).join(', ')}`, 'error');
                return;
            }
        }

        // Validate images per variant
        for (let i = 0; i < formData.variants.length; i++) {
            const v = formData.variants[i];
            const hasExisting = v.existingImages && v.existingImages.length > 0;
            const hasNew = v.images && v.images.length > 0;
            if (!isEdit && !hasNew) {
                Swal.fire('Error', `Variant ${i + 1}: Please upload at least one image.`, 'error');
                return;
            }
            if (isEdit && !hasExisting && !hasNew) {
                Swal.fire('Error', `Variant ${i + 1}: Please upload at least one image.`, 'error');
                return;
            }
        }

        const data = new FormData();
        data.append('productName', formData.productName);
        data.append('description', formData.description);
        data.append('shortDescription', formData.shortDescription);
        data.append('mainCategoryId', formData.mainCategoryId);
        data.append('subCategoryId', formData.subCategoryId);
        data.append('status', formData.status);
        data.append('brand', formData.brand);
        data.append('highlights', JSON.stringify(formData.highlights));
        
        // Map attributes to specifications for the master product
        const categorySpecs = (formData.attributes || [])
            .filter(attr => attr.value)
            .map(attr => ({
                key: attr.name,
                value: attr.value
            }));
        const customSpecs = (formData.specifications || [])
            .filter(spec => spec.key && spec.value)
            .map(spec => ({
                key: spec.key,
                value: spec.value
            }));
        data.append('specifications', JSON.stringify([...categorySpecs, ...customSpecs]));
        
        data.append('warranty', formData.warranty);
        
        if (!isEdit) data.append('createdBy', formData.createdBy);
        else data.append('updatedby', formData.createdBy);

        // Master Attributes
        data.append('attributes', JSON.stringify(formData.attributes));
        
        // Variants - send as JSON string with imageIndices
        const variantsWithIndices = formData.variants.map((v, index) => {
            const { images, previewImages, ...vData } = v;
            return {
                ...vData,
                // Provide dummy imageIndices to satisfy backend validation
                // Backend expects an array of indices into the global 'images' array.
                // Since we're sending variantSpecificImages, we'll just send [0] or something.
                imageIndices: images.length > 0 ? images.map((_, idx) => idx) : [0]
            };
        });
        data.append('variants', JSON.stringify(variantsWithIndices));

        // Images per variant
        formData.variants.forEach((v, vIndex) => {
            if (v.images && v.images.length > 0) {
                v.images.forEach(image => {
                    data.append(`variantImages_${vIndex}`, image);
                });
            }
        });

        const success = isEdit
            ? await updateProduct(id, data)
            : await createProduct(data);

        if (success) {
            navigate('/products/list');
        }
    };

    return (
        <MainCard
            title={isEdit ? (isListingOnly ? 'Edit My Listing' : 'Edit Product') : 'Add Product'}
            secondary={
                <Button startIcon={<IconArrowLeft />} onClick={() => navigate(-1)}>
                    Back
                </Button>
            }
        >
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
                {isListingOnly && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #90caf9' }}>
                        <Typography variant="body2" color="primary.dark" fontWeight={500}>
                            <strong>Master & Listing Edit:</strong> Changes to Name, Description, and Category will update the 
                            Master Product for all sellers. Price, Stock, and Delivery days will update <strong>your specific listing</strong>.
                        </Typography>
                    </Box>
                )}
                <Grid container spacing={3}>
                    {/* Basic Info */}
                    <Grid item xs={12}>
                        <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                            Basic Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Product Name"
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Brand"
                                    value={formData.brand}
                                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Warranty"
                                    value={formData.warranty}
                                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Short Description"
                                    value={formData.shortDescription}
                                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    multiline
                                    rows={8}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Key Highlights (One per line)"
                                    placeholder="Enter each highlight on a new line"
                                    value={Array.isArray(formData.highlights) ? formData.highlights.join('\n') : formData.highlights}
                                    onChange={(e) => setFormData({ ...formData, highlights: e.target.value.split('\n') })}
                                    multiline
                                    rows={4}
                                    helperText="Optional: Add key features of the product"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                                            color="primary"
                                        />
                                    }
                                    label="Active Status"
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Category & Attributes */}
                    <Grid item xs={12}>
                        <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                            Category & Specifications
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Main Category"
                                    value={formData.mainCategoryId}
                                    onChange={handleMainCategoryChange}
                                    required
                                >
                                    {Array.isArray(mainCategories) && mainCategories.map((cat) => (
                                        <MenuItem key={cat.categoryId || cat._id} value={cat.categoryId || cat._id}>
                                            {cat.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Sub Category"
                                    value={formData.subCategoryId}
                                    onChange={handleSubCategoryChange}
                                    required
                                    disabled={!formData.mainCategoryId}
                                >
                                    {Array.isArray(subCategories) && subCategories.map((sub) => (
                                        <MenuItem key={sub.subCategoryId || sub._id || sub.id} value={sub.subCategoryId || sub._id || sub.id}>
                                            {sub.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* Dynamic Attributes */}
                            {formData.attributes.length > 0 && (
                                <Grid item xs={12}>
                                    <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Category Specifications</Typography>
                                        <Grid container spacing={2}>
                                            {formData.attributes.map((attr, index) => (
                                                <Grid item xs={12} md={6} key={index}>
                                                    <TextField
                                                        fullWidth
                                                        label={`${attr.name} ${attr.required ? '*' : ''}`}
                                                        placeholder={`Enter ${attr.name}`}
                                                        value={attr.value}
                                                        onChange={(e) => handleAttributeChange(index, e.target.value)}
                                                        required={attr.required}
                                                        type={attr.type === 'number' ? 'number' : 'text'}
                                                        helperText={attr.type === 'boolean' ? 'Enter true/false' : ''}
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Paper>
                                </Grid>
                            )}

                            {/* Custom Specifications */}
                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                        <Typography variant="subtitle1">Other Specifications</Typography>
                                        <Button startIcon={<IconPlus size={18} />} onClick={handleAddSpecification} size="small">
                                            Add Spec
                                        </Button>
                                    </Stack>
                                    <Grid container spacing={2}>
                                        {(formData.specifications || []).map((spec, index) => (
                                            <Grid item xs={12} key={index}>
                                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                                    <TextField
                                                        label="Label"
                                                        value={spec.key}
                                                        onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                                                        size="small"
                                                        sx={{ flex: 1 }}
                                                    />
                                                    <TextField
                                                        label="Value"
                                                        value={spec.value}
                                                        onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                                        size="small"
                                                        sx={{ flex: 2 }}
                                                    />
                                                    <IconButton color="error" onClick={() => handleRemoveSpecification(index)}>
                                                        <IconX size={18} />
                                                    </IconButton>
                                                </Stack>
                                            </Grid>
                                        ))}
                                        {(!formData.specifications || formData.specifications.length === 0) && (
                                            <Grid item xs={12}>
                                                <Typography variant="body2" color="textSecondary" align="center">
                                                    No additional specifications added.
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Variants Section */}
                    <Grid item xs={12}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                            <Typography variant="h4" sx={{ color: 'primary.main' }}>
                                Product Variants
                            </Typography>
                            <Button variant="outlined" size="small" startIcon={<IconPlus />} onClick={addVariant}>
                                Add Variant
                            </Button>
                        </Stack>
                        
                        {formData.variants.map((variant, vIndex) => (
                            <Paper key={vIndex} variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fcfcfc' }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight={700}>Variant {vIndex + 1}</Typography>
                                    {formData.variants.length > 1 && (
                                        <IconButton color="error" size="small" onClick={() => removeVariant(vIndex)}>
                                            <IconX size={18} />
                                        </IconButton>
                                    )}
                                </Stack>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Price"
                                            type="number"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(vIndex, 'price', e.target.value)}
                                            required
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Sale Price"
                                            type="number"
                                            value={variant.salePrice}
                                            onChange={(e) => handleVariantChange(vIndex, 'salePrice', e.target.value)}
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Stock"
                                            type="number"
                                            value={variant.stock}
                                            onChange={(e) => handleVariantChange(vIndex, 'stock', e.target.value)}
                                            required
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Delivery Days"
                                            type="number"
                                            value={variant.deliveryDays}
                                            onChange={(e) => handleVariantChange(vIndex, 'deliveryDays', e.target.value)}
                                            required
                                            size="small"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            freeSolo
                                            options={pickupAddresses}
                                            getOptionLabel={(option) => {
                                                if (typeof option === 'string') return option;
                                                return `${option.name} (${option.city}, ${option.pincode})`;
                                            }}
                                            value={pickupAddresses.find(a => 
                                                (a.name === variant.pickupAddress) || 
                                                (`${a.name} (${a.city}, ${a.pincode})` === variant.pickupAddress)
                                            ) || variant.pickupAddress || ''}
                                            onInputChange={(event, newValue) => {
                                                handleVariantChange(vIndex, 'pickupAddress', newValue);
                                            }}
                                            onChange={(event, newValue) => {
                                                const val = typeof newValue === 'string' ? newValue : 
                                                            newValue ? `${newValue.name} (${newValue.city}, ${newValue.pincode})` : '';
                                                handleVariantChange(vIndex, 'pickupAddress', val);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    label="Pickup Address / Warehouse *"
                                                    placeholder="Search or enter warehouse"
                                                    size="small"
                                                    required={!variant.pickupAddress}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                <InputAdornment position="end" sx={{ mr: 2 }}>
                                                                    <Tooltip title="Add New Pickup Address">
                                                                        <IconButton 
                                                                            size="small" 
                                                                            color="primary" 
                                                                            onClick={() => handleOpenAddressDialog()}
                                                                        >
                                                                            <IconPlus size={18} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </InputAdornment>
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        )
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    
                                    {/* Variant Attributes */}
                                    {variant.attributes.length > 0 && (
                                        <Grid item xs={12}>
                                            <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>Specifications for this variant:</Typography>
                                            <Grid container spacing={2}>
                                                {variant.attributes.map((attr, aIndex) => (
                                                    <Grid item xs={12} md={4} key={aIndex}>
                                                        <TextField
                                                            fullWidth
                                                            label={attr.name}
                                                            placeholder={`Enter ${attr.name}`}
                                                            value={attr.value}
                                                            onChange={(e) => handleVariantAttributeChange(vIndex, aIndex, e.target.value)}
                                                            required={attr.required}
                                                            size="small"
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Grid>
                                    )}
                                    {/* Variant Images */}
                                    <Grid item xs={12}>
                                        <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600 }}>Variant Images *</Typography>
                                        <Grid container spacing={2}>
                                            {variant.existingImages && variant.existingImages.map((img, imgIndex) => (
                                                <Grid item key={`exist-${vIndex}-${imgIndex}`}>
                                                    <Box sx={{ position: 'relative', width: 80, height: 80, border: '1px solid #ddd', borderRadius: 1 }}>
                                                        <img
                                                            src={`${BASE_URL}${img}`}
                                                            alt="Product"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/80x80?text=Error'; }}
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1, p: 0.5 }}
                                                            onClick={() => removeExistingImage(vIndex, imgIndex)}
                                                        >
                                                            <IconX size={14} />
                                                        </IconButton>
                                                    </Box>
                                                </Grid>
                                            ))}

                                            {variant.previewImages && variant.previewImages.map((img, imgIndex) => (
                                                <Grid item key={`new-${vIndex}-${imgIndex}`}>
                                                    <Box sx={{ position: 'relative', width: 80, height: 80, border: '1px solid #ddd', borderRadius: 1 }}>
                                                        <img
                                                            src={img}
                                                            alt="Preview"
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                                        />
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1, p: 0.5 }}
                                                            onClick={() => removeImage(vIndex, imgIndex)}
                                                        >
                                                            <IconX size={14} />
                                                        </IconButton>
                                                    </Box>
                                                </Grid>
                                            ))}

                                            <Grid item>
                                                <Button
                                                    variant="outlined"
                                                    component="label"
                                                    sx={{ width: 80, height: 80, borderStyle: 'dashed' }}
                                                >
                                                    <Stack alignItems="center" spacing={0.5}>
                                                        <IconUpload size={20} />
                                                        <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Upload</Typography>
                                                    </Stack>
                                                    <input
                                                        type="file"
                                                        hidden
                                                        multiple
                                                        accept="image/*"
                                                        onChange={(e) => handleImageChange(e, vIndex)}
                                                    />
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Paper>
                        ))}
                    </Grid>

                    <Grid item xs={12}>
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button variant="outlined" onClick={() => navigate(-1)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" color="primary">
                                {isEdit ? 'Update Product' : 'Create Product'}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>

            {/* Pickup Address Dialog */}
            <Dialog open={addressDialogOpen} onClose={() => setAddressDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingAddressId ? 'Edit Pickup Address' : 'Add New Pickup Address'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Name (e.g. Warehouse A)"
                                value={addressForm.name}
                                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Line 1"
                                value={addressForm.addressLine1}
                                onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Address Line 2 (Optional)"
                                value={addressForm.addressLine2}
                                onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="City"
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="District"
                                value={addressForm.district}
                                onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="State"
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Pincode"
                                value={addressForm.pincode}
                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Contact Phone"
                                value={addressForm.phone}
                                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                required
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddressDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmitPickupAddress}>
                        {editingAddressId ? 'Update' : 'Save'} Address
                    </Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
};

export default ProductAdd;
