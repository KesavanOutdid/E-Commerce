import React, { useState } from 'react';
import {
    Box,
    CircularProgress,
    Grid,
    Pagination,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { IconEye, IconTrash, IconCheck, IconX } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useSellerContacts } from '../../hooks/contacts/SellerContactsHooks';

const SellerContacts = () => {
    const { 
        contacts, 
        loading, 
        pagination, 
        filters, 
        handlePageChange, 
        handleFilterChange, 
        updateContactStatus, 
        deleteContact 
    } = useSellerContacts();
    
    const [selectedContact, setSelectedContact] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);

    const handleViewDetail = (contact) => {
        setSelectedContact(contact);
        setOpenDetail(true);
    };

    const handleCloseDetail = () => {
        setOpenDetail(false);
        setSelectedContact(null);
    };

    const onStatusUpdate = async (id, status) => {
        const success = await updateContactStatus(id, status);
        if (success && selectedContact && selectedContact._id === id) {
            setSelectedContact({ ...selectedContact, status });
        }
    };

    return (
        <MainCard title="Seller Contacts">
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status Filter</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status Filter"
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="true">Active (Read)</MenuItem>
                                <MenuItem value="false">Pending (Unread)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Box>

            <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflowX: 'auto' }}>
                <Table sx={{ minWidth: 1000 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>SNo</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Email</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Phone</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Date</TableCell>
                            <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : contacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1">No seller contact messages found</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            contacts.map((contact, index) => (
                                <TableRow key={contact._id || index} hover>
                                    <TableCell sx={{ fontSize: '0.95rem' }}>
                                        {(pagination.currentPage - 1) * pagination.limit + index + 1}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.95rem' }}>
                                        {contact.firstName} {contact.lastName}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.95rem' }}>{contact.email}</TableCell>
                                    <TableCell sx={{ fontSize: '0.95rem' }}>{contact.phone}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={contact.status ? 'Read' : 'Unread'}
                                            color={contact.status ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.95rem' }}>
                                        {new Date(contact.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                            <IconButton 
                                                color="primary" 
                                                size="small" 
                                                onClick={() => handleViewDetail(contact)} 
                                                title="View Detail"
                                            >
                                                <IconEye size={18} />
                                            </IconButton>
                                            {!contact.status ? (
                                                <IconButton 
                                                    color="success" 
                                                    size="small" 
                                                    onClick={() => onStatusUpdate(contact._id, true)} 
                                                    title="Mark as Read"
                                                >
                                                    <IconCheck size={18} />
                                                </IconButton>
                                            ) : (
                                                <IconButton 
                                                    color="warning" 
                                                    size="small" 
                                                    onClick={() => onStatusUpdate(contact._id, false)} 
                                                    title="Mark as Unread"
                                                >
                                                    <IconX size={18} />
                                                </IconButton>
                                            )}
                                            <IconButton 
                                                color="error" 
                                                size="small" 
                                                onClick={() => deleteContact(contact._id)} 
                                                title="Delete"
                                            >
                                                <IconTrash size={18} />
                                            </IconButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {!loading && pagination.totalPages > 1 && (
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
            )}

            <Dialog open={openDetail} onClose={handleCloseDetail} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ borderBottom: '1px solid #eee', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Seller Contact Details
                    <Chip
                        label={selectedContact?.status ? 'Read' : 'Unread'}
                        color={selectedContact?.status ? 'success' : 'warning'}
                        size="small"
                    />
                </DialogTitle>
                <DialogContent>
                    {selectedContact && (
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">First Name</Typography>
                                <Typography variant="body1">{selectedContact.firstName}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Last Name</Typography>
                                <Typography variant="body1">{selectedContact.lastName}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary">Email</Typography>
                                <Typography variant="body1">{selectedContact.email}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Phone</Typography>
                                <Typography variant="body1">{selectedContact.phone}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Date</Typography>
                                <Typography variant="body1">{new Date(selectedContact.createdAt).toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary">Message</Typography>
                                <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, mt: 1 }}>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedContact.message}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    {selectedContact && !selectedContact.status && (
                        <Button onClick={() => onStatusUpdate(selectedContact._id, true)} color="success" variant="contained">
                            Mark as Read
                        </Button>
                    )}
                    <Button onClick={handleCloseDetail} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
};

export default SellerContacts;
