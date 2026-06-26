const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profile.controller');
const verifyJWT = require('../middleware/auth');

router.use(verifyJWT);

router.get('/', profileController.getProfile);
router.put('/update', profileController.updateProfile);
router.put('/change-password', profileController.changePassword);

module.exports = router;
