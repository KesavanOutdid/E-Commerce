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
        let color = 'default';
        let bgcolor = '#f5f5f5';
        let borderColor = '#bdbdbd';
        let textColor = '#757575';
        let label = status;

        switch (status?.toLowerCase()) {
            case 'pending':
                label = 'Pending';
                color = 'warning';
                bgcolor = '#fff8e1';
                borderColor = '#ffecb3';
                textColor = '#f57f17';
                break;
            case 'packed':
                label = 'Packed';
                color = 'info';
                bgcolor = '#e0f7fa';
                borderColor = '#b2ebf2';
                textColor = '#006064';
                break;
            case 'shipped':
                label = 'Shipped';
                color = 'primary';
                bgcolor = '#e8eaf6';
                borderColor = '#c5cae9';
                textColor = '#3f51b5';
                break;
            case 'out_of_delivery':
                label = 'Out of Delivery';
                color = 'secondary';
                bgcolor = '#f3e5f5';
                borderColor = '#e1bee7';
                textColor = '#7b1fa2';
                break;
            case 'delivered':
                label = 'Delivered';
                color = 'success';
                bgcolor = '#e8f5e9';
                borderColor = '#c8e6c9';
                textColor = '#2e7d32';
                break;
            case 'cancelled':
                label = 'Cancelled';
                color = 'error';
                bgcolor = '#ffebee';
                borderColor = '#ffcdd2';
                textColor = '#d32f2f';
                break;
            case 'returned':
                label = 'Returned';
                color = 'default';
                bgcolor = '#eceff1';
                borderColor = '#cfd8dc';
                textColor = '#455a64';
                break;
            default:
                break;
        }

        return (
            <Chip
                label={label || 'UNKNOWN'}
                size="small"
                sx={{
                    bgcolor: bgcolor,
                    color: textColor,
                    fontWeight: 600,
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: borderColor,
                    textTransform: 'uppercase',
                    fontSize: '0.65rem'
                }}
            />
        );
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
                                                ₹{order.grandTotal}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={order.paymentType || 'COD'}
                                                size="Medium"
                                                variant="outlined"
                                                sx={{ fontSize: '0.75rem' }}
                                            />
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
