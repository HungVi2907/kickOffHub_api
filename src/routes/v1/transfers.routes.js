const express = require('express');
const router = express.Router();
const { transfersController } = require('../../controllers');

router.get('/', transfersController.listTransfers);
router.get('/:transferId', transfersController.getTransferById);
router.post('/', transfersController.createTransfer);
router.put('/:transferId', transfersController.updateTransfer);
router.delete('/:transferId', transfersController.deleteTransfer);

module.exports = router;
