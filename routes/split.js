// Import the required modules
const express = require("express");
const {
  splitByAmount,
  splitByPercentage,
  splitByShares,
  splitByEqualAmount,
} = require("../controllers/split");
const router = express.Router();

router.post("/split-by-amount", splitByAmount);
router.post("/split-by-percentage", splitByPercentage);
router.post("/split-by-shares", splitByShares);
router.post("/split-by-optimization", splitByEqualAmount);

module.exports = router;
