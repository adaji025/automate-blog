const { Router } = require("express");
const { validate } = require("../utils/utils");
const { getLocationFromIp } = require("../controllers/ip");
const { getLocationFromIpValidator } = require("../validators/ip");

const router = Router();

router.post(
  "/location",
  getLocationFromIpValidator,
  validate,
  getLocationFromIp
);

module.exports = router;
