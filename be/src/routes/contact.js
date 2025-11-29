const { Router } = require("express");
const { validate } = require("../utils/utils");
const { createContactValidator } = require("../validators/contact");
const { createContact } = require("../controllers/contact");

const router = Router();

router.post("/create", createContactValidator, validate, createContact);

module.exports = router;
