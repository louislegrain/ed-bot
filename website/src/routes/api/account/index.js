const express = require('express');

const router = express.Router();

router.use(
   require('../../../middlewares/getUser'),
   require('../../../middlewares/requiredAuth')
);
router.post('/', require('./create'));
router.patch('/:id', require('./update'));
router.delete('/:id', require('./delete'));

module.exports = router;
