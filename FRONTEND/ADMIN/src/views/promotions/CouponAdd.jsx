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
import { IconArrowLeft, IconCamera, IconUpload, IconX } from '@tabler/icons-react';
import Swal from 'sweetalert2';

import MainCard from 'ui-component/cards/MainCard';
import { API_ENDPOINTS, BASE_URL } from '../../config/apiConfig';
import axios from '../../utils/axiosInstance';

const CouponAdd = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: 0,
        maxDiscountAmount: '',
        expiryDate: '',
        usageLimit: '',
        userLimit: 1,
        applicableType: 'all',
        applicableIds: [],
        status: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Products for selection
                const prodRes = await axios.get(`${API_ENDPOINTS.PRODUCTS.GET_ALL}?limit=1000`);
                if (prodRes.data.success) setProducts(prodRes.data.data.products || []);

                // Fetch Categories to get subcategories
                const catRes = await axios.get(`${API_ENDPOINTS.CATEGORIES.GET_ALL}?limit=1000`);
                if (catRes.data.success) {
                    const fetchedCategories = catRes.data.data.categories || [];
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
            const fetchCoupon = async () => {
                try {
                    const response = await axios.get(API_ENDPOINTS.PROMOTIONS.COUPONS.GET_BY_ID(id));
                    if (response.data.success) {
                        const data = response.data.data;
                        setFormData({
                            ...data,
                            expiryDate: data.expiryDate.split('T')[0],
                            applicableType: data.applicableTo?.type || 'all',
                            applicableIds: data.applicableTo?.ids || []
                        });
                        if (data.image) {
                            setExistingImage(data.image);
                        }
                    }
                } catch (error) {
                    Swal.fire('Error', 'Failed to fetch coupon details', 'error');
                }
            };
            fetchCoupon();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const submitData = new FormData();
            
            Object.keys(formData).forEach(key => {
                if (key === 'applicableIds') {
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
                ? await axios.put(API_ENDPOINTS.PROMOTIONS.COUPONS.UPDATE(id), submitData, config)
                : await axios.post(API_ENDPOINTS.PROMOTIONS.COUPONS.CREATE, submitData, config);

            if (response.data.success) {
                Swal.fire('Success', `Coupon ${isEdit ? 'updated' : 'created'} successfully`, 'success');
                navigate('/promotions/coupons');
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainCard 
            title={isEdit ? 'Edit Coupon' : 'Add New Coupon'}
            secondary={
                <Button variant="outlined" startIcon={<IconArrowLeft />} onClick={() => navigate('/promotions/coupons')}>
                    Back
                </Button>
            }
        >
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Coupon Code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="e.g. WELCOME100"
                            required
                            disabled={isEdit}
                            InputProps={{ sx: { textTransform: 'uppercase' } }}
                        />
                    </Grid>
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

                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Min. Order Value (₹)"
                            name="minOrderValue"
                            type="number"
                            value={formData.minOrderValue}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Max. Discount Amount (₹)"
                            name="maxDiscountAmount"
                            type="number"
                            value={formData.maxDiscountAmount}
                            onChange={handleChange}
                            helperText="Only for Percentage type"
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Expiry Date"
                            name="expiryDate"
                            type="date"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Total Usage Limit"
                            name="usageLimit"
                            type="number"
                            value={formData.usageLimit}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Limit Per User"
                            name="userLimit"
                            type="number"
                            value={formData.userLimit}
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

                    <Grid item xs={12}>
                        <Typography variant="h5" sx={{ mb: 1 }}>Coupon Image (Optional)</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                            {(imagePreview || existingImage) ? (
                                <Box sx={{ position: 'relative', width: 200, height: 120, border: '1px solid #ddd', borderRadius: 1 }}>
                                    <img
                                        src={imagePreview || `${BASE_URL}${existingImage}`}
                                        alt="Coupon"
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
                            Optional: This image will be shown to users when they view the coupon.
                        </Typography>
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
                            <Button variant="outlined" onClick={() => navigate('/promotions/coupons')}>
                                Cancel
                            </Button>
                            <Button variant="contained" type="submit" disabled={loading}>
                                {loading ? 'Saving...' : (isEdit ? 'Update Coupon' : 'Create Coupon')}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </MainCard>
    );
};

export default CouponAdd;
