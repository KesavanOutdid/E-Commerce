const Contact = require('../../models/Contact');

exports.createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, subject, phone, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !phone || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    const contactData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      subject: subject.trim(),
      phone: phone.trim(),
      message: message.trim()
    };

    const contact = await Contact.create(contactData);

    res.status(201).json({ 
      success: true, 
      message: 'Contact registered successfully!',
      data: contact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const contacts = await Contact.findAll({}, { skip, limit });
    const total = await Contact.count({});

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
