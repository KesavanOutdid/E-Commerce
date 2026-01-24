import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Grid,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Stack,
    CircularProgress
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import Swal from 'sweetalert2';

import MainCard from 'ui-component/cards/MainCard';
import { API_ENDPOINTS } from '../../config/apiConfig';
import axios from '../../utils/axiosInstance';

const CouponList = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.PROMOTIONS.COUPONS.GET_ALL);
            if (response.data.success) {
                setCoupons(response.data.data);
            }
        } catch (error) {
            console.error('Fetch coupons error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleDelete = async (id) => {
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
                await axios.delete(API_ENDPOINTS.PROMOTIONS.COUPONS.DELETE(id));
                Swal.fire('Deleted!', 'Coupon has been deleted.', 'success');
                fetchCoupons();
            } catch (error) {
                Swal.fire('Error!', error.message, 'error');
            }
        }
    };

    return (
        <MainCard
            title="Coupons Management"
            secondary={
                <Button variant="contained" startIcon={<IconPlus />} onClick={() => navigate('/promotions/coupons/add')}>
                    Add Coupon
                </Button>
            }
        >
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Code</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Discount</TableCell>
                                <TableCell>Requirements</TableCell>
                                <TableCell>Usage</TableCell>
                                <TableCell>Expiry</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {coupons.map((coupon) => (
                                <TableRow key={coupon.couponId} hover>
                                    <TableCell>
                                        <Typography variant="h4" color="primary">{coupon.code}</Typography>
                                        <Typography variant="caption">{coupon.description}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={coupon.owner?.type?.toUpperCase() || 'ADMIN'} 
                                            size="small" 
                                            variant="outlined"
                                            color={coupon.owner?.type === 'seller' ? 'secondary' : 'primary'}
                                        />
                                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                            {coupon.owner?.name || 'System'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle1">
                                            {coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '₹'} Off
                                        </Typography>
                                        {coupon.maxDiscountAmount && (
                                            <Typography variant="caption">Max: ₹{coupon.maxDiscountAmount}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">Min. Order: ₹{coupon.minOrderValue}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{coupon.usedCount} / {coupon.usageLimit || '∞'}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {new Date(coupon.expiryDate).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={coupon.status ? 'Active' : 'Inactive'} 
                                            color={coupon.status ? 'success' : 'error'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => navigate(`/promotions/coupons/edit/${coupon.couponId}`)}
                                                disabled={coupon.owner?.type !== 'admin' && coupon.owner?.type !== undefined}
                                                title={coupon.owner?.type !== 'admin' && coupon.owner?.type !== undefined ? "Cannot edit seller coupons" : "Edit"}
                                            >
                                                <IconEdit size="1.2rem" />
                                            </IconButton>
                                            <IconButton 
                                                color="error" 
                                                onClick={() => handleDelete(coupon.couponId)}
                                                disabled={coupon.owner?.type !== 'admin' && coupon.owner?.type !== undefined}
                                                title={coupon.owner?.type !== 'admin' && coupon.owner?.type !== undefined ? "Cannot delete seller coupons" : "Delete"}
                                            >
                                                <IconTrash size="1.2rem" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {coupons.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No coupons found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </MainCard>
    );
};

export default CouponList;
