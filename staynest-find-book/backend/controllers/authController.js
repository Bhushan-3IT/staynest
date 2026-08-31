const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { sendEmail, emailTemplates } = require('../utils/sendEmail');
const { generateOTP, generateOTPExpiry } = require('../utils/generateOTP');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, collegeName } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, 400, 'User already exists with this email');
    }

    // ✅ ROLE-BASED EMAIL VALIDATION:
    // - Student: MUST use @sggs.ac.in
    // - Landlord: ANY email allowed
    // - Admin: @sggs.ac.in recommended
    if (role === 'student' && !email.endsWith('@sggs.ac.in')) {
      return errorResponse(res, 400, 'Only SGGS Nanded students (@sggs.ac.in) can register as students');
    }

    // If role is landlord, any email is allowed (no validation)

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'student',
      collegeName: role === 'student' ? 'SGGS Nanded' : (collegeName || ''),
      isSGGSVerified: role === 'student' ? true : false, // Only students are SGGS verified
    });

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    // Save OTP to user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #4F46E5;">🎓 Welcome to StayNest</h2>
            <p style="color: #666;">${role === 'student' ? 'SGGS Nanded Off-Campus Housing' : 'Property Listing Platform'}</p>
          </div>
          <p>Dear ${name},</p>
          <p>Thank you for registering with StayNest! Please verify your email using the OTP below:</p>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          ${role === 'student' ? '<p style="color: #666; font-size: 14px;">✅ Only verified SGGS students can book properties.</p>' : ''}
          <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
          <p style="color: #666; font-size: 12px;">StayNest - ${role === 'student' ? 'SGGS Nanded' : 'Property Management'}</p>
        </div>
      `;
      
      await sendEmail({
        email: user.email,
        subject: `Verify Your Email - StayNest ${role === 'student' ? '(SGGS Nanded)' : ''}`,
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    // Generate token
    const token = generateToken(user._id);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      isSGGSVerified: user.isSGGSVerified,
      collegeName: user.collegeName,
      profilePhoto: user.profilePhoto,
    };

    return successResponse(res, 201, 'Registration successful. Please verify your email with OTP.', {
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }
    return errorResponse(res, 500, 'Server error during registration', error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = await User.findById(req.user._id).select('+otp +otpExpiry');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Check if OTP exists and is valid
    if (!user.otp || !user.otpExpiry) {
      return errorResponse(res, 400, 'No OTP found. Please request a new one');
    }

    // Check if OTP is expired
    if (user.otpExpiry < Date.now()) {
      return errorResponse(res, 400, 'OTP has expired. Please request a new one');
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return errorResponse(res, 400, 'Invalid OTP');
    }

    // Verify user
    user.isVerified = true;
    user.isSGGSVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // ✅ Send welcome email
    try {
      await sendEmail({
        email: user.email,
        subject: '🎓 Welcome to StayNest - SGGS Nanded!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4F46E5;">Welcome to StayNest, ${user.name}! 🎉</h2>
            <p>Your SGGS email has been verified successfully.</p>
            <p>You can now:</p>
            <ul>
              <li>🔍 Browse verified PGs near SGGS Nanded</li>
              <li>🏠 Book rooms from trusted landlords</li>
              <li>📝 Leave reviews for other SGGS students</li>
            </ul>
            <p style="color: #666; font-size: 14px;">Popular areas: Vishnupuri • CIDCO • Taramandal • Kailash Nagar</p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">StayNest - SGGS Nanded Off-Campus Housing</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      isSGGSVerified: user.isSGGSVerified,
      collegeName: user.collegeName,
      profilePhoto: user.profilePhoto,
    };

    return successResponse(res, 200, 'SGGS email verified successfully!', userData);
  } catch (error) {
    console.error('OTP verification error:', error);
    return errorResponse(res, 500, 'Server error during OTP verification', error);
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Private
const resendOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+otp +otpExpiry');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user.isVerified) {
      return errorResponse(res, 400, 'User is already verified');
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiry = generateOTPExpiry();

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save({ validateBeforeSave: false });

    // Send OTP email
    try {
      const emailHtml = emailTemplates.otpVerification(otp, user.name);
      await sendEmail({
        email: user.email,
        subject: 'New OTP - StayNest',
        html: emailHtml,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    return successResponse(res, 200, 'New OTP sent to your email');
  } catch (error) {
    console.error('Resend OTP error:', error);
    return errorResponse(res, 500, 'Server error while resending OTP', error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // ✅ FIX: Check if student has SGGS email
    if (user.role === 'student' && !user.email.endsWith('@sggs.ac.in')) {
      return errorResponse(res, 403, 'Only SGGS Nanded students can login as students');
    }

    // Generate token
    const token = generateToken(user._id);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      isSGGSVerified: user.isSGGSVerified,
      collegeName: user.collegeName,
      profilePhoto: user.profilePhoto,
    };

    return successResponse(res, 200, 'Login successful', {
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 500, 'Server error during login', error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedProperties', 'name address photos averageRating');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, 'User data fetched', user);
  } catch (error) {
    console.error('Get user error:', error);
    return errorResponse(res, 500, 'Server error while fetching user', error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, collegeName } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (collegeName && user.role === 'student') user.collegeName = collegeName;

    await user.save();

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      collegeName: user.collegeName,
      profilePhoto: user.profilePhoto,
    };

    return successResponse(res, 200, 'Profile updated successfully', userData);
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 500, 'Server error while updating profile', error);
  }
};

// @desc    Upload profile photo
// @route   POST /api/auth/upload-photo
// @access  Private
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please upload a photo');
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Update profile photo URL
    const photoUrl = `/uploads/profiles/${req.file.filename}`;
    user.profilePhoto = photoUrl;
    await user.save();

    return successResponse(res, 200, 'Profile photo uploaded successfully', {
      profilePhoto: photoUrl,
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    return errorResponse(res, 500, 'Server error while uploading photo', error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Please provide current and new password');
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse(res, 500, 'Server error while changing password', error);
  }
};

// @desc    Save property to favorites
// @route   POST /api/auth/save-property/:propertyId
// @access  Private
const saveProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Check if property already saved
    const isSaved = user.savedProperties.includes(propertyId);

    if (isSaved) {
      // Remove from saved
      user.savedProperties = user.savedProperties.filter(
        (id) => id.toString() !== propertyId
      );
      await user.save();
      return successResponse(res, 200, 'Property removed from favorites');
    } else {
      // Add to saved
      user.savedProperties.push(propertyId);
      await user.save();
      return successResponse(res, 200, 'Property saved to favorites');
    }
  } catch (error) {
    console.error('Save property error:', error);
    return errorResponse(res, 500, 'Server error while saving property', error);
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  updateProfile,
  uploadProfilePhoto,
  changePassword,
  saveProperty,
};