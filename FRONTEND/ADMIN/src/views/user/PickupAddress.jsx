import React, { useState, useEffect } from 'react';
import {
  Grid,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import MainCard from '../../ui-component/cards/MainCard';
import { usePickupAddress } from '../../hooks/profile/usePickupAddress';
import axios from 'axios';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", 
  "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
  "Lakshadweep", "Puducherry"
];

const PickupAddress = () => {
  const { addresses = [], loading, processing, addAddress, updateAddress, deleteAddress } = usePickupAddress();
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    addressLine1: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    phone: '',
    country: 'India',
    isDefault: false
  });

  const handleOpen = (address = null) => {
    if (address) {
      setFormData({
        name: address.name || '',
        addressLine1: address.addressLine1 || '',
        landmark: address.landmark || '',
        city: address.city || '',
        district: address.district || '',
        state: address.state || '',
        pincode: address.pincode || '',
        phone: address.phone || '',
        country: address.country || 'India',
        isDefault: address.isDefault || false
      });
      setSelectedId(address.id);
      setEditMode(true);
    } else {
      setFormData({
        name: '',
        addressLine1: '',
        landmark: '',
        city: '',
        district: '',
        state: '',
        pincode: '',
        phone: '',
        country: 'India',
        isDefault: false
      });
      setSelectedId(null);
      setEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-fetch if pincode is entered (6 digits)
    if (name === 'pincode' && value.length === 6) {
      fetchPincodeData(value);
    }
  };

  const fetchPincodeData = async (pincode) => {
    try {
      setFetchingPincode(true);
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      if (response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: postOffice.Block !== "NA" ? postOffice.Block : postOffice.Name,
          district: postOffice.District,
          state: postOffice.State
        }));
      }
    } catch (error) {
      console.error("Error fetching pincode data:", error);
    } finally {
      setFetchingPincode(false);
    }
  };

  const handleSubmit = async () => {
    let success;
    if (editMode) {
      success = await updateAddress(selectedId, formData);
    } else {
      success = await addAddress(formData);
    }
    if (success) handleClose();
  };

  return (
    <MainCard title="Manage Pickup Addresses">
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ textAlign: 'right' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add New Address
          </Button>
        </Grid>
        <Grid item xs={12}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>City/District</TableCell>
                  <TableCell>State</TableCell>
                  <TableCell>Pincode</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : addresses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No pickup addresses found
                    </TableCell>
                  </TableRow>
                ) : (
                  addresses.map((addr) => (
                    <TableRow 
                      key={addr.id} 
                      hover 
                      onClick={() => handleOpen(addr)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{addr.name}</TableCell>
                      <TableCell>
                        {addr.addressLine1}
                        {addr.landmark && <Typography variant="caption" display="block">Landmark: {addr.landmark}</Typography>}
                      </TableCell>
                      <TableCell>{`${addr.city}, ${addr.district}`}</TableCell>
                      <TableCell>{addr.state}</TableCell>
                      <TableCell>{addr.pincode}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          color="primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(addr);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAddress(addr.id);
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Pickup Address' : 'Add New Pickup Address'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Location Name (e.g., Main Warehouse)" name="name" value={formData.name} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address Line 1" name="addressLine1" value={formData.addressLine1} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Landmark (Optional)" name="landmark" value={formData.landmark} onChange={handleChange} />
            </Grid>
            <Grid item xs={6}>
              <TextField 
                fullWidth 
                label="Pincode" 
                name="pincode" 
                value={formData.pincode} 
                onChange={handleChange} 
                required
                InputProps={{
                  endAdornment: fetchingPincode ? <CircularProgress size={20} /> : null
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="District" name="district" value={formData.district} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth required>
                <InputLabel>State</InputLabel>
                <Select name="state" value={formData.state} label="State" onChange={handleChange}>
                  {INDIAN_STATES.map((state) => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Country" name="country" value={formData.country} disabled />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={processing || fetchingPincode}>
            {processing ? <CircularProgress size={24} /> : editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default PickupAddress;
