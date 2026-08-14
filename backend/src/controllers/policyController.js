import Policy from '../models/Policy.js';

// @desc    Get policies with optional filters for Customers
// @route   GET /api/policies
// @access  Public
export const getPolicies = async (req, res, next) => {
  try {
    const { type, maxPremium, minCoverage, search } = req.query;

    const query = {};

    if (type) {
      query.type = type;
    }

    if (maxPremium) {
      query.premium = { $lte: Number(maxPremium) };
    }

    if (minCoverage) {
      query.coverageAmount = { $gte: Number(minCoverage) };
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const policies = await Policy.find(query);
    res.status(200).json(policies);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new policy
// @route   POST /api/policies
// @access  Private/Admin
export const createPolicy = async (req, res, next) => {
  try {
    const { 
      title, 
      type, 
      coverageAmount, 
      premium, 
      termYears, 
      benefits, 
      eligibility,
      waitingPeriodDays,
      roomRentLimit,
      familySizeLimit,
      premiumFrequency
    } = req.body;

    const policy = await Policy.create({
      title,
      type,
      coverageAmount,
      premium,
      termYears,
      benefits,
      eligibility,
      waitingPeriodDays: waitingPeriodDays ? Number(waitingPeriodDays) : undefined,
      roomRentLimit: roomRentLimit ? Number(roomRentLimit) : undefined,
      familySizeLimit: familySizeLimit ? Number(familySizeLimit) : undefined,
      premiumFrequency: premiumFrequency || undefined,
    });

    res.status(201).json(policy);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a policy
// @route   PUT /api/policies/:id
// @access  Private/Admin
export const updatePolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!policy) {
      res.status(404);
      throw new Error('Policy not found');
    }

    res.status(200).json(policy);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a policy
// @route   DELETE /api/policies/:id
// @access  Private/Admin
export const deletePolicy = async (req, res, next) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);

    if (!policy) {
      res.status(404);
      throw new Error('Policy not found');
    }

    res.status(200).json({ message: 'Policy removed successfully' });
  } catch (error) {
    next(error);
  }
};
