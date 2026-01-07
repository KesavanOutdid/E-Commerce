const SellerContact = require('../../../models/SellerContact');

exports.createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, message } = req.body;

    if (!firstName || !lastName || !email || !phone || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields: First Name, Last Name, Email, Phone Number, and Message' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid phone number (10-15 digits)' 
      });
    }

    const contactData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      message: message.trim(),
      createdBy: req.userId || null
    };

    const contact = await SellerContact.create(contactData);

    res.status(201).json({ 
      success: true, 
      message: 'Thank you for contacting us! We will get back to you soon.',
      data: contact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'We encountered an issue while submitting your message. Please try again later or contact us directly.' 
    });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status !== undefined) {
      filter.status = req.query.status === 'true';
    }

    const contacts = await SellerContact.findAll(filter, { skip, limit });
    const total = await SellerContact.count(filter);

    res.status(200).json({ 
      success: true, 
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve contact messages' 
    });
  }
};

exports.getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await SellerContact.findById(id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact message not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: contact 
    });
  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve contact message' 
    });
  }
};

exports.updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    const contact = await SellerContact.updateStatus(id, status);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact message not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Contact status updated successfully',
      data: contact 
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update contact status' 
    });
  }
};

exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await SellerContact.delete(id);

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact message not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Contact message deleted successfully' 
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete contact message' 
    });
  }
};
