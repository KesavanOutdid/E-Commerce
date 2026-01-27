import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Grid,
    IconButton,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
    Chip,
    Stack,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Pagination
} from '@mui/material';
import { IconSearch, IconEye, IconFilter } from '@tabler/icons-react';
import MainCard from 'ui-component/cards/MainCard';
import { useOrders } from '../../hooks/orders/useOrders';
import { gridSpacing } from 'store/constant';

const OrderList = () => {
    const navigate = useNavigate();
    const {
        orders,
        loading,
        pagination,
        handlePageChange,
        handleFilterChange,
        filters
    } = useOrders();

    const [search, setSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleFilterChange('search', search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, handleFilterChange]);

    const getStatusChip = (status) => {
        let label = status;
        let color = '#757575'; // default grey

        switch (status?.toLowerCase()) {
            case 'pending':
                label = 'Pending';
                color = '#ed6c02'; // warning orange
                break;
            case 'packed':
                label = 'Packed';
                color = '#0288d1'; // info blue
                break;
            case 'shipped':
                label = 'Shipped';
                color = '#2196f3'; // primary blue
                break;
            case 'out_of_delivery':
                label = 'Out of Delivery';
                color = '#9c27b0'; // secondary purple
                break;
            case 'delivered':
                label = 'Delivered';
                color = '#2e7d32'; // success green
                break;
            case 'cancelled':
                label = 'Cancelled';
                color = '#d32f2f'; // error red
                break;
            case 'returned':
                label = 'Returned';
                color = '#455a64'; 
                break;
            default:
                break;
        }

        return (
            <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase', color: color }}>
                {label || 'UNKNOWN'}
            </Typography>
        );
    };

    const getPaymentColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'cod':
                return '#1976d2'; // Blue
            case 'online':
            case 'razorpay':
                return '#2e7d32'; // Green
            default:
                return '#757575';
        }
    };

    return (
        <MainCard title="Orders List">
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            placeholder="Search by ID, Name or Email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconSearch />
                                    </InputAdornment>
                                )
                            }}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel id="status-select-label">Status</InputLabel>
                            <Select
                                labelId="status-select-label"
                                value={filters.status}
                                label="Status"
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <MenuItem value="">All Statuses</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="packed">Packed</MenuItem>
                                <MenuItem value="shipped">Shipped</MenuItem>
                                <MenuItem value="out_of_delivery">Out of Delivery</MenuItem>
                                <MenuItem value="delivered">Delivered</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ width: '50px' }}>S.No</TableCell>
                                <TableCell>Order ID</TableCell>
                                <TableCell>Customer</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Total Amount</TableCell>
                                <TableCell align="center">Payment Method</TableCell>
                                <TableCell align="center"> Order Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : orders.length > 0 ? (
                                orders.map((order, index) => (
                                    <TableRow 
                                        key={order._id || order.orderId} 
                                        hover
                                        onClick={() => navigate(`/orders/view/${order.orderId || order._id}`)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell sx={{ fontWeight: 500 }}>
                                            {(pagination.currentPage - 1) * pagination.pageSize + index + 1}
                                        </TableCell>
                                        <TableCell>
                                            <Typography>
                                                {order.orderId || order._id}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {order.deliveryAddress?.name || 'Guest'}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {order.userEmail}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography fontWeight={500}>
                                                ₹{Number(order.grandTotal).toFixed(2)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 700, color: getPaymentColor(order.paymentType || 'COD') }}>
                                                {order.paymentType || 'COD'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            {getStatusChip(order.orderStatus)}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/orders/view/${order.orderId || order._id}`);
                                                }}
                                            >
                                                <IconEye size={18} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Stack direction="row" justifyContent="center" sx={{ py: 3 }}>
                    <Pagination
                        count={pagination.totalPages}
                        page={pagination.currentPage}
                        onChange={(event, value) => handlePageChange(event, value - 1)}
                        color="primary"
                        showFirstButton
                        showLastButton
                    />
                </Stack>
            </Box>
        </MainCard>
    );
};

export default OrderList;
