import Payment from '../models/Payment.js';
import UserPolicy from '../models/UserPolicy.js';

// @desc    Get logged-in user's payments
// @route   GET /api/payments/my
// @access  Private
export const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userRef: req.user._id })
      .populate({
        path: 'userPolicyRef',
        populate: { path: 'policyRef' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};

// @desc    Make a payment (monthly or custom)
// @route   POST /api/payments
// @access  Private
export const makePayment = async (req, res, next) => {
  try {
    const { userPolicyId, amount, paymentType, note } = req.body;

    if (!userPolicyId || !amount || !paymentType) {
      res.status(400);
      throw new Error('userPolicyId, amount, and paymentType are required.');
    }

    // Verify the user policy exists and belongs to the user
    const userPolicy = await UserPolicy.findById(userPolicyId);
    if (!userPolicy) {
      res.status(404);
      throw new Error('User policy not found.');
    }

    if (userPolicy.userRef.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to make payment for this policy.');
    }

    const payment = await Payment.create({
      userRef: req.user._id,
      userPolicyRef: userPolicyId,
      amount: Number(amount),
      paymentType,
      note: note || undefined,
      status: 'completed',
    });

    res.status(201).json(payment);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments (Admin/Agent)
// @route   GET /api/payments
// @access  Private/Admin
export const getAllPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('userRef', 'name email')
      .populate({
        path: 'userPolicyRef',
        populate: { path: 'policyRef' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    next(error);
  }
};
