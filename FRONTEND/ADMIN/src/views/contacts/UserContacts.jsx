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
    IconButton
} from '@mui/material';
import { IconEye } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useContacts } from '../../hooks/contacts/ContactsHooks';

const UserContacts = () => {
    const { contacts, loading, pagination, handlePageChange } = useContacts();
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

    return (
        <MainCard title="User Contacts">
            <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>SNo</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Subject</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Phone</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : contacts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body1">No contact messages found</Typography>
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
                                    <TableCell sx={{ fontSize: '0.95rem' }}>{contact.subject}</TableCell>
                                    <TableCell sx={{ fontSize: '0.95rem' }}>{contact.phone}</TableCell>
                                    <TableCell sx={{ fontSize: '0.95rem' }}>
                                        {new Date(contact.createdAt).toLocaleDateString()}
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
                <DialogTitle sx={{ borderBottom: '1px solid #eee', mb: 2 }}>
                    Contact Details
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
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Phone</Typography>
                                <Typography variant="body1">{selectedContact.phone}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Date</Typography>
                                <Typography variant="body1">{new Date(selectedContact.createdAt).toLocaleString()}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="caption" color="textSecondary">Subject</Typography>
                                <Typography variant="body1" fontWeight={600}>{selectedContact.subject}</Typography>
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
                    <Button onClick={handleCloseDetail} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
};

export default UserContacts;
