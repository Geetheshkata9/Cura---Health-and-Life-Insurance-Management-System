import Claim from '../models/Claim.js';
import UserPolicy from '../models/UserPolicy.js';

// @desc    Submit a new claim
// @route   POST /api/claims
// @access  Private
export const submitClaim = async (req, res, next) => {
  try {
    const { userPolicyId, claimAmount, reason, incidentDate } = req.body;

    // Verify user owns this policy
    const userPolicy = await UserPolicy.findOne({
      _id: userPolicyId,
      userRef: req.user._id,
    });

    if (!userPolicy) {
      res.status(404);
      throw new Error('User policy not found or does not belong to you');
    }

    // Handle file uploads (urls)
    const proofDocuments = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];

    const claim = await Claim.create({
      userPolicyRef: userPolicyId,
      userRef: req.user._id,
      claimAmount,
      reason,
      incidentDate,
      proofDocuments,
    });

    res.status(201).json(claim);
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user's claims
// @route   GET /api/claims/my
// @access  Private
export const getMyClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ userRef: req.user._id })
      .populate({
        path: 'userPolicyRef',
        populate: { path: 'policyRef' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all claims
// @route   GET /api/claims
// @access  Private/Admin
export const getAllClaims = async (req, res, next) => {
  try {
    // Basic filtering
    const status = req.query.status;
    const filter = status ? { status } : {};

    const claims = await Claim.find(filter)
      .populate('userRef', 'name email')
      .populate({
        path: 'userPolicyRef',
        populate: { path: 'policyRef', select: 'title type' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(claims);
  } catch (error) {
    next(error);
  }
};

// @desc    Update claim status
// @route   PUT /api/claims/:id/status
// @access  Private/Admin
export const updateClaimStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!['under_review', 'approved', 'rejected'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status');
    }

    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      res.status(404);
      throw new Error('Claim not found');
    }

    claim.status = status;
    if (adminRemarks !== undefined) {
      claim.adminRemarks = adminRemarks;
    }
    claim.reviewedBy = req.user._id;
    claim.reviewedAt = Date.now();

    // If claim is approved, transition UserPolicy status to 'claimed'
    if (status === 'approved') {
      await UserPolicy.findByIdAndUpdate(claim.userPolicyRef, { status: 'claimed' });
    }

    const updatedClaim = await claim.save();

    res.status(200).json(updatedClaim);
  } catch (error) {
    next(error);
  }
};
