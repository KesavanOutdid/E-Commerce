const User = require('../../../models/User');

async function getAddresses(req, res) {
  try {
    const userId = req.userId;
    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: user.addresses || []
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function addAddress(req, res) {
  try {
    const userId = req.userId;
    const { name, email, phone, doorNo, street, landmark, city, district, state, country, pincode } = req.body;

    if (!city || !state || !pincode) {
      return res.status(400).json({
        success: false,
        message: 'City, state and pincode are required'
      });
    }

    const newAddress = {
      name: name || null,
      email: email || null,
      phone: phone || null,
      doorNo: doorNo || null,
      street: street || null,
      landmark: landmark || null,
      city,
      district: district || null,
      state,
      country: country || 'India',
      pincode,
      createdAt: new Date()
    };

    const updatedUser = await User.addAddress(userId, newAddress);

    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: updatedUser.value.addresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function updateAddress(req, res) {
  try {
    const userId = req.userId;
    const { index } = req.params;
    const addressData = req.body;

    const user = await User.findByUserId(userId);
    if (!user || !user.addresses || !user.addresses[index]) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const updatedUser = await User.updateAddress(userId, index, addressData);

    return res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: updatedUser.value.addresses
    });
  } catch (error) {
    console.error('Update address error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function deleteAddress(req, res) {
  try {
    const userId = req.userId;
    const { index } = req.params;

    const user = await User.findByUserId(userId);
    if (!user || !user.addresses || !user.addresses[index]) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const updatedUser = await User.removeAddress(userId, index);

    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      data: updatedUser.value.addresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
};
