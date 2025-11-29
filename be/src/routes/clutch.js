const { Router } = require("express");
const { validate } = require("../utils/utils");
const { createClutchValidator } = require("../validators/clutch");
const { createClutch } = require("../controllers/clutch");

const router = Router();

router.post("/create", createClutchValidator, validate, createClutch);

module.exports = router;
