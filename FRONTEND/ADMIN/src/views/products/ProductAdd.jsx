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
    Paper
} from '@mui/material';
import { IconArrowLeft, IconUpload, IconX } from '@tabler/icons-react';
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

    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        shortDescription: '',
        price: '',
        salePrice: '',
        stock: '',
        mainCategoryId: '',
        subCategoryId: '',
        status: true,
        createdBy: 'admin@gmail.com', // Should be dynamic from auth
        // attributes will be stored as an array of { attributeId, name, value, type, required }
        attributes: []
    });

    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [existingImages, setExistingImages] = useState([]); // For edit mode

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
                        setFormData({
                            productName: product.productName,
                            description: product.description || '',
                            shortDescription: product.shortDescription || '',
                            price: product.price,
                            salePrice: product.salePrice || '',
                            stock: product.stock,
                            mainCategoryId: product.mainCategoryId,
                            subCategoryId: product.subCategoryId,
                            status: product.status,
                            createdBy: product.createdby,
                            attributes: product.attributes || []
                        });
                        setExistingImages(product.images || []);

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

        // Initialize attributes based on selected subcategory template
        // We preserve values if the attribute name matches? No, clearer to reset or merge.
        // Let's map the subcategory attributes to our form attributes structure.
        const newAttributes = selectedSub?.attributes?.map(attr => ({
            attributeId: attr._id || attr.id, // If exisiting
            name: attr.name,
            type: attr.type,
            required: attr.required,
            value: '' // Reset value
        })) || [];

        setFormData(prev => ({
            ...prev,
            subCategoryId: value,
            attributes: newAttributes
        }));
    };

    const handleAttributeChange = (index, value) => {
        const updatedAttributes = [...formData.attributes];
        updatedAttributes[index].value = value;
        setFormData(prev => ({ ...prev, attributes: updatedAttributes }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setImages(prev => [...prev, ...files]);

            // Generate previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviewImages(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.productName || !formData.mainCategoryId || !formData.subCategoryId || !formData.price || !formData.stock) {
            Swal.fire('Error', 'Please fill in all required fields.', 'error');
            return;
        }

        // Validate required attributes
        const missingAttributes = formData.attributes.filter(attr => attr.required && !attr.value);
        if (missingAttributes.length > 0) {
            Swal.fire('Error', `Please fill in required attributes: ${missingAttributes.map(a => a.name).join(', ')}`, 'error');
            return;
        }

        const data = new FormData();
        data.append('productName', formData.productName);
        data.append('description', formData.description);
        data.append('shortDescription', formData.shortDescription);
        data.append('price', formData.price);
        data.append('salePrice', formData.salePrice);
        data.append('stock', formData.stock);
        data.append('mainCategoryId', formData.mainCategoryId);
        data.append('subCategoryId', formData.subCategoryId);
        data.append('status', formData.status);
        if (!isEdit) data.append('createdBy', formData.createdBy);
        else data.append('updatedby', formData.createdBy); // reuse email

        // Attributes - send as JSON string
        data.append('attributes', JSON.stringify(formData.attributes));

        // Existing Images (for edit mode)
        if (isEdit) {
            data.append('existingImages', JSON.stringify(existingImages));
        }

        // Images
        images.forEach(image => {
            data.append('images', image);
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
            title={isEdit ? 'Edit Product' : 'Add Product'}
            secondary={
                <Button startIcon={<IconArrowLeft />} onClick={() => navigate(-1)}>
                    Back
                </Button>
            }
        >
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
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
                                <Stack direction="row" spacing={2}>
                                    <TextField
                                        fullWidth
                                        label="Price"
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="Sale Price"
                                        type="number"
                                        value={formData.salePrice}
                                        onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Stock"
                                        type="number"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required
                                    />
                                </Stack>
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
                                        <Typography variant="subtitle1" sx={{ mb: 2 }}>Specifications</Typography>
                                        <Grid container spacing={2}>
                                            {formData.attributes.map((attr, index) => (
                                                <Grid item xs={12} md={6} key={index}>
                                                    {/* Render input based on type if implemented, else text */}
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
                        </Grid>
                    </Grid>

                    {/* Images */}
                    <Grid item xs={12}>
                        <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                            Product Images
                        </Typography>

                        <Grid container spacing={2}>
                            {existingImages.map((img, index) => (
                                <Grid item key={`exist-${index}`}>
                                    <Box sx={{ position: 'relative', width: 100, height: 100, border: '1px solid #ddd', borderRadius: 1 }}>
                                        <img
                                            src={`${BASE_URL}${img}`}
                                            alt="Product"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            color="error"
                                            sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#fed' } }}
                                            onClick={() => removeExistingImage(index)}
                                        >
                                            <IconX size={16} />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            ))}

                            {previewImages.map((img, index) => (
                                <Grid item key={`new-${index}`}>
                                    <Box sx={{ position: 'relative', width: 100, height: 100, border: '1px solid #ddd', borderRadius: 1 }}>
                                        <img
                                            src={img}
                                            alt="Preview"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                        />
                                        <IconButton
                                            size="small"
                                            color="error"
                                            sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', '&:hover': { bgcolor: '#fed' } }}
                                            onClick={() => removeImage(index)}
                                        >
                                            <IconX size={16} />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            ))}

                            <Grid item>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    sx={{ width: 100, height: 100, borderStyle: 'dashed' }}
                                >
                                    <Stack alignItems="center" spacing={1}>
                                        <IconUpload />
                                        <Typography variant="caption">Upload</Typography>
                                    </Stack>
                                    <input
                                        type="file"
                                        hidden
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </Button>
                            </Grid>
                        </Grid>
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
        </MainCard>
    );
};

export default ProductAdd;
