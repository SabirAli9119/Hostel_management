const Request = require('../models/Request');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginationMeta } = require('../utils/pagination');
const { qs, searchRegex, pickEnum } = require('../utils/query');
const { validateRequest } = require('../utils/validators');
const { REQUEST_STATUSES } = require('../config/constants');

// All handlers here are for the signed-in resident and only touch their own requests.

// POST /api/requests
exports.createRequest = asyncHandler(async (req, res) => {
  const v = validateRequest(req.body);
  const request = await Request.create({
    user: req.user._id,
    ...v,
    status: 'Pending',
    history: [{ status: 'Pending', note: 'Request submitted' }],
  });
  res.status(201).json({ request });
});

// GET /api/requests/my-requests?search=&status=&page=&limit=
exports.myRequests = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  const status = pickEnum(req.query.status, REQUEST_STATUSES);
  if (status) filter.status = status;
  if (qs(req.query.search)) {
    const rx = searchRegex(req.query.search);
    filter.$or = [{ title: rx }, { description: rx }];
  }

  const { page, limit, skip } = getPagination(req.query);
  const [requests, total] = await Promise.all([
    Request.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Request.countDocuments(filter),
  ]);
  res.json({ requests, pagination: paginationMeta(page, limit, total) });
});

// GET /api/requests/:id
exports.getRequest = asyncHandler(async (req, res) => {
  const request = await Request.findOne({ _id: req.params.id, user: req.user._id }).lean();
  if (!request) throw new AppError(404, 'Request not found.');
  res.json({ request });
});

// PUT /api/requests/:id  (only while Pending; residents can never change status)
exports.updateRequest = asyncHandler(async (req, res) => {
  const v = validateRequest(req.body);
  const request = await Request.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, status: 'Pending' },
    { $set: v, $push: { history: { status: 'Pending', note: 'Edited by resident', at: new Date() } } },
    { new: true, runValidators: true }
  );
  if (!request) {
    const exists = await Request.exists({ _id: req.params.id, user: req.user._id });
    throw exists ? new AppError(409, 'Only pending requests can be edited.') : new AppError(404, 'Request not found.');
  }
  res.json({ request });
});

// DELETE /api/requests/:id  (cancel; only while Pending)
exports.cancelRequest = asyncHandler(async (req, res) => {
  const removed = await Request.findOneAndDelete({ _id: req.params.id, user: req.user._id, status: 'Pending' });
  if (!removed) {
    const exists = await Request.exists({ _id: req.params.id, user: req.user._id });
    throw exists ? new AppError(409, 'Only pending requests can be cancelled.') : new AppError(404, 'Request not found.');
  }
  res.json({ message: 'Request cancelled.' });
});
