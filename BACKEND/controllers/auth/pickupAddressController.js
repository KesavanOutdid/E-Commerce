const User = require('../../models/User');

exports.addPickupAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const addressData = req.body;

    // Basic validation
    if (!addressData.name || !addressData.addressLine1 || !addressData.city || !addressData.district || !addressData.state || !addressData.pincode || !addressData.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address fields'
      });
    }

    const updatedUser = await User.addPickupAddress(userId, addressData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pickup address added successfully',
      data: updatedUser.pickupAddresses
    });
  } catch (error) {
    console.error('Error in addPickupAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.getPickupAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByUserId(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.pickupAddresses || []
    });
  } catch (error) {
    console.error('Error in getPickupAddresses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.updatePickupAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;
    const addressData = req.body;

    // Basic validation
    if (!addressData.name || !addressData.addressLine1 || !addressData.city || !addressData.district || !addressData.state || !addressData.pincode || !addressData.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required address fields'
      });
    }

    const updatedUser = await User.updatePickupAddress(userId, addressId, addressData);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User or address not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pickup address updated successfully',
      data: updatedUser.pickupAddresses
    });
  } catch (error) {
    console.error('Error in updatePickupAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

exports.removePickupAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId } = req.params;

    const updatedUser = await User.removePickupAddress(userId, addressId);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pickup address removed successfully',
      data: updatedUser.pickupAddresses
    });
  } catch (error) {
    console.error('Error in removePickupAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
