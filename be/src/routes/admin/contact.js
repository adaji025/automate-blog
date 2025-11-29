const { Router } = require("express");
const { ALL_ADMIN } = require("../../constants/roles");
const router = Router();
const { authToken } = require("../../middleware/authToken");
const { verifyRoles } = require("../../middleware/verifyRoles");
const { getLeads } = require("../../controllers/admin/contact");

router.get("/list", authToken, verifyRoles(ALL_ADMIN), getLeads);

module.exports = router;
