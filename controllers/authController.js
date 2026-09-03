const Artisan = require('../models/Artisan');

// GET PUBLIC ARTISANS (PAGINATED, SENSITIVE DATA EXCLUDED)
exports.getArtisans = async (req, res) => {
  try {
    const { category, region, rating, search, page = 1, limit = 10 } = req.query;
    const query = { isVerified: true }; // Show verified profiles only

    if (category) query.category = category;
    if (region) query.region = region;
    if (rating) query.rating = { $gte: parseFloat(rating) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // MEDIATOR RULE: Exclude sensitive contact fields from the database projection
    const artisans = await Artisan.find(query)
      .select('-phone -email -whatsapp -userId')
      .skip(skip)
      .limit(limitNum)
      .sort({ rating: -1 });

    const total = await Artisan.countDocuments(query);

    res.status(200).json({
      success: true,
      count: artisans.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: artisans
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET SINGLE ARTISAN PUBLIC (SENSITIVE DATA EXCLUDED)
exports.getArtisanById = async (req, res) => {
  try {
    // MEDIATOR RULE: Ensure contact details are hidden on individual calls
    const artisan = await Artisan.findOne({ _id: req.params.id, isVerified: true })
      .select('-phone -email -whatsapp -userId');

    if (!artisan) {
      return res.status(404).json({ success: false, message: 'Artisan profile not found.' });
    }

    res.status(200).json({ success: true, data: artisan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ARTISAN PROFILE UPDATE (SELF ONLY)
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, portfolioImages, availabilityStatus, phone, email, whatsapp } = req.body;
    let artisan = await Artisan.findOne({ _id: req.params.id, userId: req.user.id });

    if (!artisan) {
      return res.status(403).json({ success: false, message: 'Unauthorized profile update action.' });
    }

    artisan.name = name || artisan.name;
    artisan.bio = bio || artisan.bio;
    artisan.portfolioImages = portfolioImages || artisan.portfolioImages;
    artisan.availabilityStatus = availabilityStatus || artisan.availabilityStatus;
    artisan.phone = phone || artisan.phone;
    artisan.email = email || artisan.email;
    artisan.whatsapp = whatsapp || artisan.whatsapp;

    await artisan.save();
    res.status(200).json({ success: true, message: 'Profile updated successfully.', data: artisan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ADMIN VIEW ALL LISTINGS (SENSITIVE CONTACT DATA EXPOSED FOR COORDINATION)
exports.adminGetAllArtisans = async (req, res) => {
  try {
    const artisans = await Artisan.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: artisans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ADMIN ONLY VERIFICATION STATUS TOGGLE
exports.verifyArtisan = async (req, res) => {
  try {
    const artisan = await Artisan.findById(req.params.id);
    if (!artisan) {
      return res.status(404).json({ success: false, message: 'Artisan not found.' });
    }

    artisan.isVerified = !artisan.isVerified;
    await artisan.save();

    res.status(200).json({ 
      success: true, 
      message: `Artisan verification status set to: ${artisan.isVerified}` 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};