import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
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

const OfferList = () => {
    const navigate = useNavigate();
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.PROMOTIONS.OFFERS.GET_ALL);
            if (response.data.success) {
                setOffers(response.data.data);
            }
        } catch (error) {
            console.error('Fetch offers error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
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
                await axios.delete(API_ENDPOINTS.PROMOTIONS.OFFERS.DELETE(id));
                Swal.fire('Deleted!', 'Offer has been deleted.', 'success');
                fetchOffers();
            } catch (error) {
                Swal.fire('Error!', error.message, 'error');
            }
        }
    };

    return (
        <MainCard
            title="Offers Management"
            secondary={
                <Button variant="contained" startIcon={<IconPlus />} onClick={() => navigate('/promotions/offers/add')}>
                    Add Offer
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
                                <TableCell>Name</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Applicable To</TableCell>
                                <TableCell>Discount</TableCell>
                                <TableCell>Period</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {offers.map((offer) => (
                                <TableRow key={offer.offerId} hover>
                                    <TableCell>
                                        <Typography variant="subtitle1">{offer.name}</Typography>
                                        <Typography variant="caption">{offer.description}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={offer.owner?.type?.toUpperCase() || 'ADMIN'} 
                                            size="small" 
                                            variant="outlined"
                                            color={offer.owner?.type === 'seller' ? 'secondary' : 'primary'}
                                        />
                                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                            {offer.owner?.name || 'System'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={offer.type.replace('_', ' ').toUpperCase()} size="small" />
                                    </TableCell>
                                    <TableCell>{offer.applicableTo.type.toUpperCase()}</TableCell>
                                    <TableCell>
                                        {offer.type === 'quantity_tiered' 
                                            ? `${offer.tiers.length} Tiers` 
                                            : `${offer.discountValue}${offer.discountType === 'percentage' ? '%' : '₹'}`}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={offer.status ? 'Active' : 'Inactive'} 
                                            color={offer.status ? 'success' : 'error'} 
                                            size="small" 
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => navigate(`/promotions/offers/edit/${offer.offerId}`)}
                                                disabled={offer.owner?.type !== 'admin' && offer.owner?.type !== undefined}
                                                title={offer.owner?.type !== 'admin' && offer.owner?.type !== undefined ? "Cannot edit seller offers" : "Edit"}
                                            >
                                                <IconEdit size="1.2rem" />
                                            </IconButton>
                                            <IconButton 
                                                color="error" 
                                                onClick={() => handleDelete(offer.offerId)}
                                                disabled={offer.owner?.type !== 'admin' && offer.owner?.type !== undefined}
                                                title={offer.owner?.type !== 'admin' && offer.owner?.type !== undefined ? "Cannot delete seller offers" : "Delete"}
                                            >
                                                <IconTrash size="1.2rem" />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {offers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">No offers found</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </MainCard>
    );
};

export default OfferList;
