import React, { useState, useEffect } from 'react';
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
    TableRow,
    TablePagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Stack,
    CircularProgress,
    Switch,
    FormControlLabel,
    Paper,
    Avatar,
    Chip,
    Pagination
} from '@mui/material';
import { IconPlus, IconEye, IconCategory, IconSearch } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

import MainCard from 'ui-component/cards/MainCard';
import { useCategories } from '../../hooks/categories/useCategories';

import { API_BASE_URL } from '../../config/apiConfig';

const BASE_URL = API_BASE_URL.replace('/api', '');

const Categories = () => { // Renamed component from Categories to CategoriesPage
    const {
        categories,
        loading,
        openDialog,
        editMode,
        formData,
        pagination,
        handleOpenDialog,
        handleCloseDialog,
        handleSubmit,
        handlePageChange,
        handleFilterChange,
        updateFormData
    } = useCategories();

    const navigate = useNavigate();

    const [search, setSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            handleFilterChange('search', search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, handleFilterChange]);

    const handleImageChange = (e) => { // Added handleImageChange function
        const file = e.target.files[0];
        if (file) {
            updateFormData('image', file);
        }
    };

    return (
        <MainCard 
            title="Categories"
            secondary={
                <Button variant="contained" color="primary" startIcon={<IconPlus />} onClick={() => handleOpenDialog()}>
                    Add Category
                </Button>
            }
        >
            <Box>
            <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            fullWidth
                            placeholder="Search categories..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconSearch size={18} />
                                    </InputAdornment>
                                )
                            }}
                            size="small"
                        />
                    </Grid>
                </Grid>
            </Box>
            <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>SNo</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Image</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Name</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Created By</TableCell>
                            <TableCell sx={{ fontSize: '1rem', fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="center" sx={{ fontSize: '1rem', fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body1" sx={{ py: 3 }}>
                                        No categories found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category, index) => (
                                <TableRow 
                                    key={category._id || category.id} 
                                    hover
                                    onClick={() => navigate(`/categories/${category._id || category.id}`)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell sx={{ fontSize: '0.95rem' }}>{index + 1 + (pagination.currentPage - 1) * pagination.pageSize}</TableCell>
                                    <TableCell>
                                        <Avatar
                                            src={category.image ? `${BASE_URL}${category.image}` : ''}
                                            alt={category.name}
                                            variant="rounded"
                                            sx={{ width: 45, height: 45 }}
                                        >
                                            <IconCategory />
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {category.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.95rem' }}>{category.createdBy || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={category.status ? 'Active' : 'Inactive'}
                                            color={category.status ? 'success' : 'default'}
                                            size="small"
                                            sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton 
                                                color="info" 
                                                size="small" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/categories/${category._id || category.id}`);
                                                }} 
                                                title="View"
                                            >
                                                <IconEye size={20} />
                                            </IconButton>
                                            {/* <IconButton color="primary" size="small" onClick={() => handleOpenDialog(category)} title="Edit">
                                                <IconEdit size={18} />
                                            </IconButton>
                                            <IconButton color="error" size="small" onClick={() => handleDeleteCategory(category._id || category.id)} title="Delete">
                                                <IconTrash size={18} />
                                            </IconButton> */}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {!loading && pagination.totalItems > 0 && (
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
            </Box>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? 'Edit Category' : 'Add Category'}</DialogTitle> {/* Changed title */}
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}> {/* Added image preview */}
                            <Box
                                component="img"
                                src={
                                    formData.image instanceof File
                                        ? URL.createObjectURL(formData.image)
                                        : formData.image
                                            ? `${BASE_URL}${formData.image}`
                                            : 'https://via.placeholder.com/150'
                                }
                                sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12}> {/* Added file input button */}
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                startIcon={<IconPlus />}
                            >
                                Upload Image
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Name" // Changed label
                                value={formData.name}
                                onChange={(e) => updateFormData('name', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.status}
                                        onChange={(e) => updateFormData('status', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Active"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editMode ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </MainCard>
    );
};

export default Categories;
