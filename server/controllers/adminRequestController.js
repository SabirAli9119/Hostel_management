const Request = require('../models/Request');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginationMeta } = require('../utils/pagination');
const { qs, searchRegex, pickEnum } = require('../utils/query');
const { validateRequestUpdate } = require('../utils/validators');
const { REQUEST_STATUSES, REQUEST_CATEGORIES, PRIORITIES } = require('../config/constants');

// GET /api/admin/requests?search=&status=&category=&priority=&page=&limit=
exports.listRequests = asyncHandler(async (req, res) => {
  const filter = {};
  const status = pickEnum(req.query.status, REQUEST_STATUSES);
  if (status) filter.status = status;
  const category = pickEnum(req.query.category, REQUEST_CATEGORIES);
  if (category) filter.category = category;
  const priority = pickEnum(req.query.priority, PRIORITIES);
  if (priority) filter.priority = priority;

  if (qs(req.query.search)) {
    const rx = searchRegex(req.query.search);
    const residentIds = await User.find({ role: 'user', $or: [{ fullName: rx }, { username: rx }] }).distinct('_id');
    filter.$or = [{ title: rx }, { description: rx }, { user: { $in: residentIds } }];
  }

  const { page, limit, skip } = getPagination(req.query);
  const [requests, total] = await Promise.all([
    Request.find(filter).populate('user', 'fullName username').sort('-createdAt').skip(skip).limit(limit).lean(),
    Request.countDocuments(filter),
  ]);
  res.json({ requests, pagination: paginationMeta(page, limit, total) });
});

// GET /api/admin/requests/:id
exports.getRequest = asyncHandler(async (req, res) => {
  const request = await Request.findById(req.params.id).populate('user', 'fullName username phone').lean();
  if (!request) throw new AppError(404, 'Request not found.');
  res.json({ request });
});

// PUT /api/admin/requests/:id  { status, adminResponse, rejectionReason }
exports.updateRequest = asyncHandler(async (req, res) => {
  const v = validateRequestUpdate(req.body);
  const request = await Request.findById(req.params.id);
  if (!request) throw new AppError(404, 'Request not found.');

  const rejectionReason = v.status === 'Rejected' ? v.rejectionReason : '';
  const changed =
    request.status !== v.status ||
    request.adminResponse !== v.adminResponse ||
    request.rejectionReason !== rejectionReason;

  request.status = v.status;
  request.adminResponse = v.adminResponse;
  request.rejectionReason = rejectionReason;
  request.resolvedAt = v.status === 'Resolved' ? request.resolvedAt || new Date() : null;
  if (changed) {
    request.history.push({ status: v.status, note: v.status === 'Rejected' ? rejectionReason : v.adminResponse, at: new Date() });
  }
  await request.save();

  await request.populate('user', 'fullName username phone');
  res.json({ request });
});
