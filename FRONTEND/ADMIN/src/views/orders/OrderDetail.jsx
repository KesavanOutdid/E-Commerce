import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    CardContent,
    Grid,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    CircularProgress,
    Divider,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Avatar
} from '@mui/material';
import {
    IconArrowLeft,
    IconCurrencyRupee,
    IconTruckDelivery,
    IconCalendar,
    IconMapPin,
    IconCreditCard,
    IconUser
} from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/apiConfig';
import Swal from 'sweetalert2';

const BASE_URL = API_BASE_URL.replace('/api', '');

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId));
            if (response.data.success) {
                setOrder(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching order", error);
            Swal.fire('Error', 'Order not found', 'error');
            navigate('/orders/list');
        } finally {
            setLoading(false);
        }
    }, [orderId, navigate]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleStatusUpdate = async (newStatus) => {
        try {
            setStatusLoading(true);
            const response = await axios.patch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), { status: newStatus });
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: `Order status changed to ${newStatus}`,
                    timer: 1500,
                    showConfirmButton: false
                });
                fetchOrder();
            }
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Failed to update status', 'error');
        } finally {
            setStatusLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'warning';
            case 'processing': return 'info';
            case 'shipped': return 'primary';
            case 'delivered': return 'success';
            case 'cancelled': return 'error';
            case 'returned': return 'default';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!order) return null;

    return (
        <MainCard
            title={
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Button onClick={() => navigate('/orders/list')} sx={{ minWidth: 0, p: 1 }}>
                        <IconArrowLeft />
                    </Button>
                    <Typography variant="h3">Order #{order.orderId || order._id}</Typography>
                    <Chip
                        label={order.orderStatus}
                        color={getStatusColor(order.orderStatus)}
                        size="small"
                        sx={{ ml: 2, textTransform: 'uppercase', fontWeight: 'bold' }}
                    />
                </Stack>
            }
            /* secondary={
                <Box sx={{ minWidth: 200 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Update Status</InputLabel>
                        <Select
                            value={order.orderStatus}
                            label="Update Status"
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            disabled={statusLoading}
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="processing">Processing</MenuItem>
                            <MenuItem value="shipped">Shipped</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                            <MenuItem value="returned">Returned</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            } */
        >
            <Grid container spacing={3}>
                {/* Order Summary Cards */}
                <Grid item xs={12} md={8}>
                    {/* Order Items */}
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #eee' }}>
                            <Typography variant="h4">Order Items ({order.items?.length || 0})</Typography>
                        </Box>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                        <TableCell align="center">Quantity</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.items?.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar
                                                        src={item.images?.length ? `${BASE_URL}${item.images[0]}` : ''}
                                                        variant="rounded"
                                                        sx={{ width: 50, height: 50 }}
                                                    />
                                                    <Box>
                                                        <Typography variant="subtitle2" fontWeight={600}>
                                                            {item.productName || 'Product Name'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">₹{item.price}</TableCell>
                                            <TableCell align="center">{item.qty || item.quantity}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                ₹{item.totalPrice}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>

                    {/* Transaction Info */}
                    <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                        <Typography variant="h4" sx={{ mb: 2 }}>Order Timeline</Typography>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <IconCalendar size={20} color="#757575" />
                                <Box>
                                    <Typography variant="caption" display="block">Placed on</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {new Date(order.createdAt).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <IconCreditCard size={20} color="#757575" />
                                <Box>
                                    <Typography variant="caption" display="block">Payment Method</Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {order.paymentType ? order.paymentType.toUpperCase() : 'COD'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </Paper>
                </Grid>

                {/* Right Sidebar */}
                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        {/* Customer Info */}
                        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                            <Typography variant="h4" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconUser size={20} /> Customer Details
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle1">{order.deliveryAddress?.name || 'Guest User'}</Typography>
                                <Typography variant="body2" color="textSecondary">{order.userEmail}</Typography>
                                <Typography variant="body2" color="textSecondary">{order.deliveryAddress?.phone || 'No phone'}</Typography>
                            </Box>
                        </Paper>

                        {/* Shipping Address */}
                        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                            <Typography variant="h4" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconTruckDelivery size={20} /> Shipping Address
                            </Typography>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    {order.deliveryAddress?.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-line' }}>
                                    {[
                                        order.deliveryAddress?.doorNo,
                                        order.deliveryAddress?.street,
                                        order.deliveryAddress?.landmark,
                                        order.deliveryAddress?.city,
                                        order.deliveryAddress?.state,
                                        order.deliveryAddress?.pincode,
                                        order.deliveryAddress?.country
                                    ].filter(Boolean).join(', \n')}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Phone: {order.deliveryAddress?.phone}
                                </Typography>
                            </Box>
                        </Paper>

                        {/* Order Summary */}
                        <Paper variant="outlined" sx={{ borderRadius: 2, p: 2, bgcolor: '#fafafa' }}>
                            <Typography variant="h4" sx={{ mb: 2 }}>Order Summary</Typography>
                            <Stack spacing={1}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="textSecondary">Subtotal</Typography>
                                    <Typography variant="body2">₹{order.subTotal}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="textSecondary">Shipping</Typography>
                                    <Typography variant="body2">₹{order.shippingFees || 0}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color="textSecondary">GST</Typography>
                                    <Typography variant="body2">₹{order.gst || 0}</Typography>
                                </Stack>
                                {order.codFees > 0 && (
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2" color="textSecondary">COD Fees</Typography>
                                        <Typography variant="body2">₹{order.codFees}</Typography>
                                    </Stack>
                                )}
                                <Divider sx={{ my: 1 }} />
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle1">Total</Typography>
                                    <Typography variant="subtitle1" color="primary">₹{order.grandTotal}</Typography>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Stack>
                </Grid>
            </Grid>
        </MainCard>
    );
};

export default OrderDetail;
