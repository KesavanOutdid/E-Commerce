import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Grid,
    TextField,
    MenuItem,
    Typography,
    Stack,
    Divider,
    FormControl,
    InputLabel,
    Select,
    Switch,
    FormControlLabel,
    IconButton,
    Autocomplete,
    Chip
} from '@mui/material';
import { IconArrowLeft, IconPlus, IconTrash, IconCamera, IconUpload, IconX } from '@tabler/icons-react';
import Swal from 'sweetalert2';

import MainCard from 'ui-component/cards/MainCard';
import { API_ENDPOINTS, BASE_URL } from '../../config/apiConfig';
import axios from '../../utils/axiosInstance';

const OfferAdd = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'direct',
        applicableType: 'all',
        applicableIds: [],
        discountType: 'percentage',
        discountValue: 0,
        startDate: '',
        endDate: '',
        status: true,
        tiers: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products with large limit for selection
                const prodRes = await axios.get(`${API_ENDPOINTS.PRODUCTS.GET_ALL}?limit=1000`);
                if (prodRes.data.success) setProducts(prodRes.data.data.products || []);

                // Fetch Categories with large limit
                const catRes = await axios.get(`${API_ENDPOINTS.CATEGORIES.GET_ALL}?limit=1000`);
                if (catRes.data.success) {
                    const fetchedCategories = catRes.data.data.categories || [];
                    setCategories(fetchedCategories);

                    // Fetch all Subcategories (Flattened for multi-select)
                    const subCatPromises = fetchedCategories.map(cat => 
                        axios.get(API_ENDPOINTS.CATEGORIES.GET_SUB_BY_PARENT(cat.categoryId))
                    );
                    const subCatResponses = await Promise.all(subCatPromises);
                    const allSubs = subCatResponses.flatMap(res => res.data.data || []);
                    setSubCategories(allSubs);
                }

            } catch (error) {
                console.error('Error fetching selection data:', error);
            }
        };
        fetchData();

        if (isEdit) {
            const fetchOffer = async () => {
                try {
                    const response = await axios.get(API_ENDPOINTS.PROMOTIONS.OFFERS.GET_BY_ID(id));
                    if (response.data.success) {
                        const data = response.data.data;
                        setFormData({
                            ...data,
                            applicableType: data.applicableTo?.type || 'all',
                            applicableIds: data.applicableTo?.ids || [],
                            startDate: data.startDate.split('T')[0],
                            endDate: data.endDate.split('T')[0]
                        });
                        if (data.image) {
                            setExistingImage(data.image);
                        }
                    }
                } catch (error) {
                    Swal.fire('Error', 'Failed to fetch offer details', 'error');
                }
            };
            fetchOffer();
        }
    }, [id, isEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const removeExistingImage = () => {
        setExistingImage(null);
    };

    const handleTierChange = (index, field, value) => {
        const newTiers = [...formData.tiers];
        newTiers[index][field] = value;
        setFormData({ ...formData, tiers: newTiers });
    };

    const addTier = () => {
        setFormData({
            ...formData,
            tiers: [...formData.tiers, { minQty: 2, discountType: 'percentage', value: 5 }]
        });
    };

    const removeTier = (index) => {
        const newTiers = formData.tiers.filter((_, i) => i !== index);
        setFormData({ ...formData, tiers: newTiers });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            const submitData = new FormData();
            
            // Append flat fields
            Object.keys(formData).forEach(key => {
                if (key === 'tiers') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else if (key === 'applicableIds') {
                    // Send as stringified array or multiple appends depending on backend
                    // The backend model expects an array, so we stringify it or let axios/multer handle it
                    // multer-form-data usually needs stringified for complex objects
                    submitData.append(key, JSON.stringify(formData[key]));
                } else {
                    submitData.append(key, formData[key]);
                }
            });

            if (imageFile) {
                submitData.append('image', imageFile);
            } else if (existingImage) {
                submitData.append('image', existingImage);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            };

            const response = isEdit 
                ? await axios.put(API_ENDPOINTS.PROMOTIONS.OFFERS.UPDATE(id), submitData, config)
                : await axios.post(API_ENDPOINTS.PROMOTIONS.OFFERS.CREATE, submitData, config);

            if (response.data.success) {
                Swal.fire('Success', `Offer ${isEdit ? 'updated' : 'created'} successfully`, 'success');
                navigate('/promotions/offers');
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainCard 
            title={isEdit ? 'Edit Offer' : 'Add New Offer'}
            secondary={
                <Button variant="outlined" startIcon={<IconArrowLeft />} onClick={() => navigate('/promotions/offers')}>
                    Back
                </Button>
            }
        >
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Offer Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Offer Type</InputLabel>
                            <Select
                                name="type"
                                value={formData.type}
                                label="Offer Type"
                                onChange={handleChange}
                            >
                                <MenuItem value="direct">Direct Discount</MenuItem>
                                <MenuItem value="quantity_tiered">Quantity Tiered (Multi-buy)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            multiline
                            rows={2}
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Applicable To</InputLabel>
                            <Select
                                name="applicableType"
                                value={formData.applicableType}
                                label="Applicable To"
                                onChange={(e) => {
                                    setFormData({ ...formData, applicableType: e.target.value, applicableIds: [] });
                                }}
                            >
                                <MenuItem value="all">All Products</MenuItem>
                                <MenuItem value="category">Specific Categories / Subcategories</MenuItem>
                                <MenuItem value="product">Specific Products</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        {formData.applicableType === 'product' && (
                            <Autocomplete
                                multiple
                                options={products}
                                getOptionLabel={(option) => option.productName}
                                value={products.filter(p => formData.applicableIds.includes(p.productId))}
                                onChange={(event, newValue) => {
                                    setFormData({ ...formData, applicableIds: newValue.map(v => v.productId) });
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" label="Select Products" placeholder="Search Products..." />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip label={option.productName} {...getTagProps({ index })} size="small" />
                                    ))
                                }
                            />
                        )}

                        {formData.applicableType === 'category' && (
                            <Autocomplete
                                multiple
                                options={subCategories}
                                getOptionLabel={(option) => option.name}
                                value={subCategories.filter(s => formData.applicableIds.includes(s.subCategoryId))}
                                onChange={(event, newValue) => {
                                    setFormData({ ...formData, applicableIds: newValue.map(v => v.subCategoryId) });
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} variant="outlined" label="Select Subcategories" placeholder="Search Categories..." />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip label={option.name} {...getTagProps({ index })} size="small" color="primary" variant="outlined" />
                                    ))
                                }
                            />
                        )}
                    </Grid>

                    {formData.type === 'direct' && (
                        <>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Discount Type</InputLabel>
                                    <Select
                                        name="discountType"
                                        value={formData.discountType}
                                        label="Discount Type"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="percentage">Percentage (%)</MenuItem>
                                        <MenuItem value="fixed">Fixed Amount (₹)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Discount Value"
                                    name="discountValue"
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                        </>
                    )}

                    {formData.type === 'quantity_tiered' && (
                        <Grid item xs={12}>
                            <Typography variant="h5" sx={{ mb: 2 }}>Discount Tiers</Typography>
                            {formData.tiers.map((tier, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                                    <TextField
                                        label="Min Qty"
                                        type="number"
                                        value={tier.minQty}
                                        onChange={(e) => handleTierChange(index, 'minQty', e.target.value)}
                                        size="small"
                                    />
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            value={tier.discountType}
                                            label="Type"
                                            onChange={(e) => handleTierChange(index, 'discountType', e.target.value)}
                                        >
                                            <MenuItem value="percentage">Percentage (%)</MenuItem>
                                            <MenuItem value="fixed">Fixed (₹)</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Value"
                                        type="number"
                                        value={tier.value}
                                        onChange={(e) => handleTierChange(index, 'value', e.target.value)}
                                        size="small"
                                    />
                                    <IconButton color="error" onClick={() => removeTier(index)}>
                                        <IconTrash size="1.2rem" />
                                    </IconButton>
                                </Box>
                            ))}
                            <Button variant="outlined" startIcon={<IconPlus />} onClick={addTier} size="small">
                                Add Tier
                            </Button>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ mb: 1 }}>Promotion Image</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            {(imagePreview || existingImage) ? (
                                <Box sx={{ position: 'relative', width: 200, height: 120, border: '1px solid #ddd', borderRadius: 1 }}>
                                    <img
                                        src={imagePreview || `${BASE_URL}${existingImage}`}
                                        alt="Promotion"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                    />
                                    <IconButton
                                        size="small"
                                        color="error"
                                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1, p: 0.5 }}
                                        onClick={imagePreview ? removeImage : removeExistingImage}
                                    >
                                        <IconX size={14} />
                                    </IconButton>
                                </Box>
                            ) : (
                                <>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<IconUpload />}
                                    >
                                        Upload Image
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        startIcon={<IconCamera />}
                                        color="secondary"
                                    >
                                        Take Photo
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handleImageChange}
                                        />
                                    </Button>
                                </>
                            )}
                        </Stack>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            Recommended size: 800x400 pixels. This image will be used as a cover for the promotion.
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Start Date"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="End Date"
                            name="endDate"
                            type="date"
                            value={formData.endDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
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

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button variant="outlined" onClick={() => navigate('/promotions/offers')}>
                                Cancel
                            </Button>
                            <Button variant="contained" type="submit" disabled={loading}>
                                {loading ? 'Saving...' : (isEdit ? 'Update Offer' : 'Create Offer')}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </MainCard>
    );
};

export default OfferAdd;
