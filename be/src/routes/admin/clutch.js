const { Router } = require("express");
const { ALL_ADMIN } = require("../../constants/roles");
const router = Router();
const { authToken } = require("../../middleware/authToken");
const { verifyRoles } = require("../../middleware/verifyRoles");
const { getClutchList } = require("../../controllers/admin/clutch");

router.get("/list", authToken, verifyRoles(ALL_ADMIN), getClutchList);

module.exports = router;
