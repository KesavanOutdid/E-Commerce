import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Grid,
    Typography,
    Stack,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Divider
} from '@mui/material';
import { IconArrowLeft, IconEdit, IconTrash, IconPlus, IconChevronDown } from '@tabler/icons-react';

import MainCard from 'ui-component/cards/MainCard';
import { useCategoryDetail } from '../../hooks/categories/useCategoryDetail';

const DetailItem = ({ label, value, status }) => (
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
        {status !== undefined ? (
            <Typography
                variant="body1"
                sx={{
                    fontWeight: 600,
                    color: status ? 'success.main' : 'error.main',
                    fontSize: '1rem'
                }}
            >
                {status ? 'Active' : 'Inactive'}
            </Typography>
        ) : (
            <Typography
                variant="body1"
                sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '1rem'
                }}
            >
                {value || '-'}
            </Typography>
        )}
    </Box>
);

const CategoryDetail = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const {
        category,
        subCategories,
        loading,
        openDialog,
        openSubDialog,
        editMode,
        formData,
        subFormData,
        handleEditCategory,
        handleCloseDialog,
        handleUpdateCategory,
        handleDeleteCategory,
        handleOpenSubDialog,
        handleCloseSubDialog,
        handleSubmitSubCategory,
        handleDeleteSubCategory,
        updateFormData,
        updateSubFormData,
        handleAddAttribute,
        handleRemoveAttribute,
        handleAttributeChange
    } = useCategoryDetail(categoryId);

    if (loading) {
        return (
            <MainCard title="Category Details">
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                </Box>
            </MainCard>
        );
    }

    if (!category) {
        return (
            <MainCard title="Category Details">
                <Typography variant="h6" color="error">
                    Category not found
                </Typography>
                <Button variant="contained" startIcon={<IconArrowLeft />} onClick={() => navigate('/categories')} sx={{ mt: 2 }}>
                    Back to Categories
                </Button>
            </MainCard>
        );
    }

    return (
        <>
            <MainCard
                title={category.name}
                secondary={
                    <Stack direction="row" spacing={1}>
                        <Button variant="outlined" startIcon={<IconArrowLeft />} onClick={() => navigate('/categories')}>
                            Back
                        </Button>
                        <Button variant="contained" color="primary" startIcon={<IconEdit />} onClick={handleEditCategory}>
                            Edit
                        </Button>
                        <Button variant="contained" color="error" startIcon={<IconTrash />} onClick={handleDeleteCategory}>
                            Delete
                        </Button>
                    </Stack>
                }
            >
                <Box sx={{ p: 1 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h4" sx={{ mb: 2, color: 'primary.main', borderBottom: '1px solid #eee', pb: 1 }}>
                                Basic Information
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DetailItem label="Name" value={category.name} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DetailItem label="Status" status={category.status} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DetailItem label="Created By" value={category.createdBy} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DetailItem label="Updated By" value={category.updatedby} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DetailItem label="Created At" value={category.createdAt ? new Date(category.createdAt).toLocaleString() : '-'} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DetailItem label="Updated At" value={category.updatedAt ? new Date(category.updatedAt).toLocaleString() : '-'} />
                        </Grid>

                        {/* Sub Categories Section */}
                        <Grid item xs={12} sx={{ mt: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, borderBottom: '1px solid #eee', pb: 1 }}>
                                <Typography variant="h4" sx={{ color: 'primary.main' }}>
                                    Sub Categories
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<IconPlus />}
                                    onClick={() => handleOpenSubDialog()}
                                >
                                    Add Sub Category
                                </Button>
                            </Stack>

                            {subCategories.length > 0 ? (
                                <Box>
                                    {subCategories.map((sub) => (
                                        <Accordion key={sub._id || sub.id} sx={{ mb: 1, border: '1px solid #eee' }} disableGutters elevation={0}>
                                            <AccordionSummary expandIcon={<IconChevronDown size={20} />}>
                                                <Grid container alignItems="center" spacing={2}>
                                                    <Grid item xs={12} sm={4}>
                                                        <Typography variant="subtitle1" fontWeight="bold">{sub.name}</Typography>
                                                    </Grid>
                                                    <Grid item xs={6} sm={2}>
                                                        <Chip
                                                            label={sub.status ? 'Active' : 'Inactive'}
                                                            size="small"
                                                            color={sub.status ? 'success' : 'default'}
                                                            variant="outlined"
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6} sm={4}>
                                                        <Typography variant="caption" display="block" color="textSecondary">
                                                            {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : '-'}
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={(e) => { e.stopPropagation(); handleOpenSubDialog(sub); }}
                                                        >
                                                            <IconEdit size={18} />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteSubCategory(sub._id || sub.id); }}
                                                        >
                                                            <IconTrash size={18} />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </AccordionSummary>
                                            <AccordionDetails sx={{ pt: 0 }}>
                                                <Divider sx={{ mb: 2 }} />
                                                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                                                    Specifications (Attributes)
                                                </Typography>
                                                {sub.attributes && sub.attributes.length > 0 ? (
                                                    <Grid container spacing={1}>
                                                        {sub.attributes.map((attr, idx) => (
                                                            <Grid item key={idx}>
                                                                <Chip
                                                                    label={`${attr.name} (${attr.type}) ${attr.required ? 'Required: Yes' : 'Required: No'}`}
                                                                    size="small"
                                                                    variant="filled"
                                                                    sx={{ borderRadius: '4px' }}
                                                                />
                                                            </Grid>
                                                        ))}
                                                    </Grid>
                                                ) : (
                                                    <Typography variant="caption" color="textSecondary">
                                                        No specifications defined.
                                                    </Typography>
                                                )}
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="caption" color="textSecondary" display="block">
                                                        Created by: {sub.createdBy || '-'}{sub.updatedby ? ` | Updated by: ${sub.updatedby}` : ''}
                                                    </Typography>
                                                </Box>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 2 }}>
                                    No subcategories found.
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            </MainCard>

            {/* Edit Main Category Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Category</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Category Name"
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
                    <Button onClick={handleUpdateCategory} variant="contained" color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Sub Category Dialog */}
            <Dialog open={openSubDialog} onClose={handleCloseSubDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? 'Edit Sub Category' : 'Add Sub Category'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Sub Category Name"
                                value={subFormData.name}
                                onChange={(e) => updateSubFormData('name', e.target.value)}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={subFormData.status}
                                        onChange={(e) => updateSubFormData('status', e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Active"
                            />
                        </Grid>

                        {/* Specifications / Attributes Section */}
                        <Grid item xs={12}>
                            <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>Specifications (Attributes)</Typography>
                            {subFormData.attributes && subFormData.attributes.map((attr, index) => (
                                <Grid container spacing={2} key={index} sx={{ mb: 2, p: 1, border: '1px dashed #ccc', borderRadius: 1 }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Name"
                                            size="small"
                                            value={attr.name}
                                            onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                                            required
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Type"
                                            size="small"
                                            value={attr.type}
                                            onChange={(e) => handleAttributeChange(index, 'type', e.target.value)}
                                            SelectProps={{
                                                native: true,
                                            }}
                                        >
                                            <option value="text">Text</option>
                                            <option value="number">Number</option>
                                            <option value="boolean">Yes/No</option>
                                            <option value="date">Date</option>
                                        </TextField>
                                    </Grid>
                                    <Grid item xs={10}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={attr.required}
                                                    onChange={(e) => handleAttributeChange(index, 'required', e.target.checked)}
                                                    size="small"
                                                />
                                            }
                                            label="Required"
                                        />
                                    </Grid>
                                    <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <IconButton color="error" onClick={() => handleRemoveAttribute(index)}>
                                            <IconTrash size={18} />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            ))}
                            <Button variant="outlined" startIcon={<IconPlus />} size="small" onClick={handleAddAttribute}>
                                Add Specification
                            </Button>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSubDialog}>Cancel</Button>
                    <Button onClick={handleSubmitSubCategory} variant="contained" color="primary">
                        {editMode ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CategoryDetail;
