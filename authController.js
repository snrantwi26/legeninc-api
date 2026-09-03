const User = require('../models/User');
const Artisan = require('../models/Artisan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerArtisan = async (req, res) => {
  try {
    const { 
      email, password, name, category, region, city, 
      community, phone, whatsapp, bio, portfolioImages 
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with this email address.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      password: hashedPassword,
      role: 'artisan'
    });
    await user.save();

    const artisan = new Artisan({
      userId: user._id,
      name,
      category,
      region,
      city,
      community,
      phone,
      email,
      whatsapp,
      bio,
      portfolioImages: portfolioImages || [],
      isVerified: false // Forces administrative verification
    });
    await artisan.save();

    res.status(201).json({ 
      success: true, 
      message: 'Artisan registration complete. Pending administrative vetting and verification.' 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    let artisanId = null;
    if (user.role === 'artisan') {
      const profile = await Artisan.findOne({ userId: user._id });
      artisanId = profile ? profile._id : null;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, artisanId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, role: user.role, artisanId }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};