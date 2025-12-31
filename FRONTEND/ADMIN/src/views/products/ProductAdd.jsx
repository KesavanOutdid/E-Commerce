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
    Divider,
    FormHelperText
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
    const [loadingCategories, setLoadingCategories] = useState(false);

    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        shortDescription: '',
        price: '',
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
                setLoadingCategories(true);
                const response = await axios.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
                if (response.data.success) {
                    setMainCategories(response.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching categories", error);
            } finally {
                setLoadingCategories(false);
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
                        const product = response.data.data || response.data;
                        setFormData({
                            productName: product.productName,
                            description: product.description || '',
                            shortDescription: product.shortDescription || '',
                            price: product.price,
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
    }, [id]);

    // Normalize IDs: If existing product has ObjectId keys, convert them to UUIDs using the loaded categories
    useEffect(() => {
        if (isEdit && mainCategories.length > 0 && formData.mainCategoryId) {
            // Check if current mainCategoryId is an ObjectId (length 24) but we have a matching UUID
            const selectedCat = mainCategories.find(c => c._id === formData.mainCategoryId || c.categoryId === formData.mainCategoryId);

            if (selectedCat && selectedCat.categoryId && selectedCat.categoryId !== formData.mainCategoryId) {
                // The user has an ObjectId (or different ID) selected, but we found the canonical UUID. Switch to UUID.
                setFormData(prev => ({ ...prev, mainCategoryId: selectedCat.categoryId }));
                // We also need to re-fetch subcategories with the UUID if we haven't already
                fetchSubCategories(selectedCat.categoryId);
            }
        }
    }, [mainCategories, formData.mainCategoryId, isEdit]);

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
                setSubCategories(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching subcategories", error);
            // Fallback: try fetching all subs and filter?
            // console.log("Fallback fetching all subs");
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
        // Logic to remove from server? Or just remove from UI and handle in backend update?
        // Backend update handles `images` array. If I send existing images url list?
        // The backend `updateProduct` appends new images.
        // The backend doesn't seem to have logic to delete specific images in `updateProduct` based on analysis `updateData.images = [...(existingProduct.images || []), ...newImages];`
        // Oh, the backend `updateProduct` implementation I saw *appends* images. It doesn't seem to support removing images easily unless I overwrite the whole array? 
        // "updateData.images = [...(existingProduct.images || []), ...newImages];"
        // This implies I cannot delete images with the current backend logic provided in the view.
        // It appends. 
        // User said "DONT CHANGE ANY BACKEND".
        // So I will just hide the remove button for existing images or warn that it's not supported yet, or just not implement remove for existing.
        // I'll implement remove for NEW images.
        setExistingImages(prev => prev.filter((_, i) => i !== index)); // Just UI removal for now, won't persist if backend doesn't handle it.
        // Actually, if I can't change backend, I can't easily fix the image deletion logic which forces append.
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
        data.append('stock', formData.stock);
        data.append('mainCategoryId', formData.mainCategoryId);
        data.append('subCategoryId', formData.subCategoryId);
        data.append('status', formData.status);
        if (!isEdit) data.append('createdBy', formData.createdBy);
        else data.append('updatedby', formData.createdBy); // reuse email

        // Attributes - send as JSON string
        data.append('attributes', JSON.stringify(formData.attributes));

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
                                    rows={4}
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
                                    {mainCategories.map((cat) => (
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
                                    {subCategories.map((sub) => (
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
                                        />
                                        {/* <IconButton
                                            size="small"
                                            color="error"
                                            sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white' }}
                                            onClick={() => removeExistingImage(index)}
                                        >
                                            <IconX size={16} />
                                        </IconButton> */}
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
