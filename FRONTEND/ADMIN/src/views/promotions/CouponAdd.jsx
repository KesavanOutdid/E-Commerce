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
    Autocomplete,
    Chip
} from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import Swal from 'sweetalert2';

import MainCard from 'ui-component/cards/MainCard';
import { API_ENDPOINTS } from '../../config/apiConfig';
import axios from '../../utils/axiosInstance';

const CouponAdd = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const apiCall = isEdit 
                ? axios.put(API_ENDPOINTS.PROMOTIONS.COUPONS.UPDATE(id), formData)
                : axios.post(API_ENDPOINTS.PROMOTIONS.COUPONS.CREATE, formData);

            const response = await apiCall;
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
