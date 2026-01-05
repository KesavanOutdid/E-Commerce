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
    Chip
} from '@mui/material';
import { IconPlus, IconEdit, IconTrash, IconEye, IconCategory } from '@tabler/icons-react';
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
        handleDeleteCategory,
        handlePageChange,
        updateFormData
    } = useCategories();

    const navigate = useNavigate();

    const handleImageChange = (e) => { // Added handleImageChange function
        const file = e.target.files[0];
        if (file) {
            updateFormData('image', file);
        }
    };

    return (
        <MainCard title="Categories"> {/* Changed title */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}> {/* Moved button outside MainCard secondary prop */}
                <Button variant="contained" startIcon={<IconPlus />} onClick={() => handleOpenDialog()}>
                    Add Category
                </Button>
            </Box>

            <TableContainer component={Paper}> {/* Wrapped TableContainer with Paper */}
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>SNo</TableCell>
                            <TableCell>Image</TableCell> {/* Added Image column */}
                            <TableCell>Name</TableCell>
                            <TableCell>Created By</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? ( // Added loading state handling
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? ( // Adjusted colSpan for no categories found
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography variant="body1" sx={{ py: 3 }}>
                                        No categories found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category, index) => (
                                <TableRow key={category._id || category.id}>
                                    <TableCell>{index + 1 + (pagination.currentPage - 1) * pagination.pageSize}</TableCell> {/* Adjusted SNo calculation */}
                                    <TableCell> {/* Added Image cell */}
                                        <Avatar
                                            src={category.image ? `${BASE_URL}${category.image}` : ''}
                                            alt={category.name}
                                            variant="rounded"
                                        >
                                            <IconCategory />
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle1" fontWeight={500}>
                                            {category.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{category.createdBy || '-'}</TableCell>
                                    <TableCell>
                                        <Chip // Replaced Typography with Chip for status
                                            label={category.status ? 'Active' : 'Inactive'}
                                            color={category.status ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <IconButton color="info" size="small" onClick={() => navigate(`/categories/${category._id || category.id}`)} title="View">
                                                <IconEye size={18} />
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
                <TablePagination
                    component="div"
                    count={pagination.totalItems}
                    page={pagination.currentPage - 1}
                    onPageChange={handlePageChange}
                    rowsPerPage={pagination.pageSize}
                    rowsPerPageOptions={[10]}
                />
            )}

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
