import UserPolicy from '../models/UserPolicy.js';
import Policy from '../models/Policy.js';

// @desc    Get logged in user's policies
// @route   GET /api/user-policies/my
// @access  Private
export const getMyPolicies = async (req, res, next) => {
  try {
    const policies = await UserPolicy.find({ userRef: req.user._id })
      .populate('policyRef')
      .populate('coveredMembers', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(policies);
  } catch (error) {
    next(error);
  }
};

// @desc    Purchase a policy
// @route   POST /api/user-policies/buy
// @access  Private
export const buyPolicy = async (req, res, next) => {
  try {
    const { policyId, coveredMembers, beneficiary } = req.body;
    const userId = req.user._id;

    if (!policyId) {
      res.status(400);
      throw new Error('Policy ID is required');
    }

    const policy = await Policy.findById(policyId);
    
    if (!policy) {
      res.status(404);
      throw new Error('Policy not found');
    }

    // Calculate end date based on termYears
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + (policy.termYears || 1));

    const userPolicy = await UserPolicy.create({
      userRef: userId,
      policyRef: policyId,
      endDate: endDate,
      status: 'active',
      paymentStatus: 'paid', // Mark as paid upon purchase
      coveredMembers: coveredMembers || [],
      beneficiary: beneficiary || undefined,
    });

    res.status(201).json(userPolicy);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user policies (Admin/Agent)
// @route   GET /api/user-policies
// @access  Private/Admin
export const getAllUserPolicies = async (req, res, next) => {
  try {
    const policies = await UserPolicy.find()
      .populate('userRef', 'name email')
      .populate('policyRef')
      .populate('coveredMembers', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json(policies);
  } catch (error) {
    next(error);
  }
};
