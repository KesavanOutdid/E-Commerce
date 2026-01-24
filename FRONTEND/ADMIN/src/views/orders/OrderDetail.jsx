import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    CardContent,
    Grid2 as Grid,
    IconButton,
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
    IconUser,
    IconPhone,
    IconMail,
    IconBuildingStore,
    IconPackage,
    IconBarcode
} from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import axios from '../../utils/axiosInstance';
import { API_ENDPOINTS, API_BASE_URL } from '../../config/apiConfig';
import Swal from 'sweetalert2';

const BASE_URL = API_BASE_URL.replace('/api', '');

const DetailItem = ({ label, value, color }) => (
    <Box sx={{ mb: 3 }}>
        <Typography
            variant="caption"
            sx={{
                color: 'text.secondary',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                mb: 0.5
            }}
        >
            {label}
        </Typography>
        {typeof value === 'string' || typeof value === 'number' ? (
            <Typography
                variant="body1"
                sx={{
                    fontWeight: 600,
                    color: color || 'text.primary',
                    fontSize: '1rem'
                }}
            >
                {value || '-'}
            </Typography>
        ) : (
            value
        )}
    </Box>
);

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
        let updateData = { status: newStatus };

        if (newStatus === 'shipped') {
            updateData.deliveryStatus = 'shipped';
        } else if (newStatus === 'delivered') {
            updateData.deliveryStatus = 'delivered';
        }

        try {
            setStatusLoading(true);
            const response = await axios.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId), updateData);
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Status Updated',
                    text: `Order status changed to ${getStatusLabel(newStatus)}`,
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
            case 'packed': return 'info';
            case 'shipped': return 'primary';
            case 'out_of_delivery': return 'secondary';
            case 'delivered': return 'success';
            case 'cancelled': return 'error';
            case 'returned': return 'default';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'Pending';
            case 'packed': return 'Packed';
            case 'shipped': return 'Shipped';
            case 'out_of_delivery': return 'Out of Delivery';
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            case 'returned': return 'Returned';
            default: return status;
        }
    };

    const statusHierarchy = ['pending', 'packed', 'shipped', 'out_of_delivery', 'delivered'];

    const isStatusDisabled = (targetStatus) => {
        if (!order?.orderStatus) return false;
        const currentIndex = statusHierarchy.indexOf(order.orderStatus);
        const targetIndex = statusHierarchy.indexOf(targetStatus);
        
        // If both are in hierarchy, check if target is backwards
        if (currentIndex !== -1 && targetIndex !== -1) {
            return targetIndex < currentIndex;
        }
        return false;
    };

    if (loading) {
        return (
            <MainCard title="Order Details">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            </MainCard>
        );
    }

    if (!order) {
        return (
            <MainCard title="Order Details">
                <Typography variant="h6" color="error">
                    Order not found
                </Typography>
                <Button variant="contained" startIcon={<IconArrowLeft />} onClick={() => navigate('/orders/list')} sx={{ mt: 2 }}>
                    Go Back
                </Button>
            </MainCard>
        );
    }

    const isOnlinePending = (order?.paymentType?.toLowerCase() === 'online' || order?.paymentType?.toLowerCase() === 'razorpay') && order?.paymentStatus?.toLowerCase() === 'pending';

    return (
        <MainCard
            title="Order Details"
            secondary={
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button variant="outlined" startIcon={<IconArrowLeft />} onClick={() => navigate('/orders/list')}>
                        Back
                    </Button>
                    <Box sx={{ minWidth: 150 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={order.orderStatus}
                                label="Status"
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                disabled={statusLoading || isOnlinePending}
                            >
                                <MenuItem value="packed" disabled={isStatusDisabled('packed')}>Packed</MenuItem>
                                <MenuItem value="shipped" disabled={isStatusDisabled('shipped')}>Shipped</MenuItem>
                                <MenuItem value="out_of_delivery" disabled={isStatusDisabled('out_of_delivery')}>Out of Delivery</MenuItem>
                                <MenuItem value="delivered" disabled={isStatusDisabled('delivered')}>Delivered</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Stack>
            }
        >
            <Box sx={{ p: 1 }}>
                {isOnlinePending && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', borderRadius: 1, border: '1px solid', borderColor: 'error.main' }}>
                        <Typography color="error.dark" fontWeight={600}>
                            Warning: Status updates are disabled because the online payment is still pending. 
                            The payment must be completed before processing this order.
                        </Typography>
                    </Box>
                )}
                <Grid container spacing={1}>
                    {/* Header section with Order Info */}
                    <Grid size={12} sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={3}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light', color: 'primary.main', mb: 1 }}>
                                    <IconTruckDelivery size={40} />
                                </Avatar>
                            </Box>

                            <Box>
                                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
                                    Order {order.orderId || order._id}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Placed on: {new Date(order.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </Stack>

                        <Stack direction="column" spacing={1.5} alignItems="flex-end">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: 'text.secondary', 
                                        fontWeight: 500, 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    Order Status
                                </Typography>
                                <Chip
                                    label={getStatusLabel(order.orderStatus)}
                                    color={getStatusColor(order.orderStatus)}
                                    size="small"
                                    sx={{ 
                                        fontWeight: 700, 
                                        borderRadius: '6px',
                                        textTransform: 'uppercase',
                                        fontSize: '0.7rem'
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        color: 'text.secondary', 
                                        fontWeight: 500, 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    Total Amount
                                </Typography>
                                <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                                    ₹{order.grandTotal}
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Order Information Section */}
                    <Grid size={12} sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Order Information</Typography>
                    </Grid>
                    {/* <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Order ID" value={order.orderId || order._id} />
                    </Grid> */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Order Date" value={new Date(order.createdAt).toLocaleString()} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Payment Method" value={order.paymentType?.toUpperCase() || 'COD'} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Payment Status" value={
                            <Typography sx={{ fontWeight: 600 }}>
                                {order.paymentStatus || 'Pending'}
                            </Typography>
                        } />
                    </Grid>
                    {/* <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Order Status" value={
                            <Chip 
                                label={order.orderStatus} 
                                color={getStatusColor(order.orderStatus)} 
                                size="small" 
                                sx={{ fontWeight: 600, textTransform: 'uppercase' }} 
                            />
                        } />
                    </Grid> */}

                    {/* Customer Section */}
                    <Grid size={12} sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Customer Details</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Customer Name" value={order.deliveryAddress?.name || 'Guest User'} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Email ID" value={order.userEmail} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <DetailItem label="Phone Number" value={order.deliveryAddress?.phone || '-'} />
                    </Grid>

                    {/* Shipping Address Section */}
                    <Grid size={12} sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Shipping Address</Typography>
                    </Grid>
                    <Grid size={12} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Grid container spacing={1}>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="Door No" value={order.deliveryAddress?.doorNo} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="Street" value={order.deliveryAddress?.street} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="Landmark" value={order.deliveryAddress?.landmark} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="City" value={order.deliveryAddress?.city} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="District" value={order.deliveryAddress?.district} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="State" value={order.deliveryAddress?.state} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="Pincode" value={order.deliveryAddress?.pincode} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="Country" value={order.deliveryAddress?.country} />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Order Summary Section */}
                    <Grid size={12} sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Order Summary</Typography>
                    </Grid>
                    <Grid size={12} sx={{ mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <Grid container spacing={1}>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="Subtotal" value={`₹${order.subTotal}`} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="Shipping" value={`₹${order.shippingFees || 0}`} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="GST" value={`₹${order.gst || 0}`} />
                            </Grid>
                            {order.codFees > 0 && (
                                <Grid size={{ xs: 12, md: 3 }}>
                                    <DetailItem label="COD Fees" value={`₹${order.codFees}`} />
                                </Grid>
                            )}
                            <Grid size={{ xs: 12, md: 3 }}>
                                <DetailItem label="Grand Total" value={`₹${order.grandTotal}`} color="primary.main" />
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Status History Section */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                        <>
                            <Grid size={12} sx={{ mt: 2, mb: 1 }}>
                                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Order Status History</Typography>
                            </Grid>
                            <Grid size={12} sx={{ mb: 2 }}>
                                <TableContainer component={Box} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                    <Table size="small">
                                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Updated By</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                                                <TableCell sx={{ fontWeight: 600 }}>Note</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {order.statusHistory.map((history, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Chip 
                                                            label={getStatusLabel(history.status)} 
                                                            color={getStatusColor(history.status)} 
                                                            size="small" 
                                                            sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.65rem' }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{history.updatedBy || 'System'}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{new Date(history.timestamp).toLocaleString()}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="caption" sx={{ fontStyle: 'italic' }}>{history.note || '-'}</Typography>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </>
                    )}

                    {/* Order Items Section */}
                    <Grid size={12} sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 600 }}>Order Items ({order.items?.length || 0})</Typography>
                    </Grid>
                    <Grid size={12}>
                        <TableContainer component={Box} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                            <Table>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Product & Seller</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {order.items?.map((item, index) => {
                                        return (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                                        <Avatar
                                                            src={item.images?.length ? (item.images[0].startsWith('http') ? item.images[0] : `${BASE_URL}${item.images[0]}`) : ''}
                                                            variant="rounded"
                                                            sx={{ width: 60, height: 60 }}
                                                        />
                                                        <Box>
                                                            <Typography 
                                                                variant="subtitle1" 
                                                                fontWeight={600} 
                                                                color="primary"
                                                                sx={{
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    lineHeight: '1.4em',
                                                                    height: '2.8em'
                                                                }}
                                                            >
                                                                {item.productName || 'Product Name'}
                                                            </Typography>
                                                            
                                                            {item.sellerDetails ? (
                                                                <Box sx={{ mt: 0.5 }}>
                                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600, color: 'text.secondary' }}>
                                                                        <IconBuildingStore size={14} /> {item.sellerDetails.storeName}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                                        <IconUser size={14} /> {item.sellerDetails.sellerName}
                                                                    </Typography>
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="caption" color="error">Admin Product</Typography>
                                                            )}
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell align="right">₹{item.price}</TableCell>
                                                <TableCell align="center">{item.qty || item.quantity}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                    ₹{item.totalPrice}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Grid>

                </Grid>
            </Box>
        </MainCard>
    );
};

export default OrderDetail;
