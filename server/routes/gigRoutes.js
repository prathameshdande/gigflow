const express = require('express');
const { createGig, getGigs, getGig } = require('../controllers/gigController');
const verifyToken = require('../middleware/verifyToken');
console.log(createGig, getGigs, getGig);

const router = express.Router();

router.post('/', verifyToken, createGig);
router.get('/', getGigs);
router.get('/:id', getGig);

module.exports = router;