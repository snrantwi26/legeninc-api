const Request = require('../models/Request');

// CLIENT INITIATES MEDIATION REQUEST
exports.createRequest = async (req, res) => {
  try {
    const { 
      clientName, clientPhone, clientEmail, serviceCategory, 
      description, preferredDate, location, artisanId 
    } = req.body;

    const request = new Request({
      clientName,
      clientPhone,
      clientEmail,
      serviceCategory,
      description,
      preferredDate,
      location,
      artisanId,
      status: 'pending'
    });

    await request.save();
    res.status(201).json({ 
      success: true, 
      message: 'Mediation request received. LegenInc GH staff will coordinate and contact you shortly.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ADMIN VIEW PENDING & MEDIATION REQUESTS
exports.adminGetRequests = async (req, res) => {
  try {
    // Exposes artisan details to administrators so they can coordinate communication
    const requests = await Request.find()
      .populate('artisanId', 'name phone email category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ADMIN MEDIATION LOGS MODIFICATION
exports.adminUpdateRequest = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Service request record not found.' });
    }

    if (status) request.status = status;
    if (adminResponse !== undefined) request.adminResponse = adminResponse;

    await request.save();
    res.status(200).json({ success: true, message: 'Request parameters updated successfully.', data: request });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};