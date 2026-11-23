const express = require('express');
const requests = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/auth');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();
router.use(protect, authorize('user'));

router.post('/', requests.createRequest);
router.get('/my-requests', requests.myRequests); // before /:id
router.get('/:id', validateObjectId('id'), requests.getRequest);
router.put('/:id', validateObjectId('id'), requests.updateRequest);
router.delete('/:id', validateObjectId('id'), requests.cancelRequest);

module.exports = router;
