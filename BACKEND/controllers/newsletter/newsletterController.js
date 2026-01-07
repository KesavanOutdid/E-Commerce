const Newsletter = require('../../models/Newsletter');

exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide an email address' 
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    const existingSubscription = await Newsletter.findByEmail(email);
    if (existingSubscription) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already subscribed to our newsletter' 
      });
    }

    const subscription = await Newsletter.create(email);

    res.status(201).json({ 
      success: true, 
      message: 'Subscribed to newsletter successfully!',
      data: subscription
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

exports.getNewsletters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const newsletters = await Newsletter.findAll({}, { skip, limit });
    const total = await Newsletter.count({});

    res.status(200).json({ 
      success: true, 
      data: newsletters,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get newsletters error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve newsletter subscriptions' 
    });
  }
};
