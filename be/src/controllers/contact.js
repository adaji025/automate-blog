const Contact = require("../models/Contact");
const handleResponse = require("../utils/response");
const axios = require("axios");

exports.createContact = async (req, res, next) => {
  try {
    const { fullName, email, subject, message, phone, captcha } = req.body;

    const captchaResponse = await axios.post(
      "https://global.frcapi.com/api/v2/captcha/siteverify",
      {
        sitekey: process.env.FRIENDLY_CAPTCHA_SITE_KEY,
        response: captcha,
      },
      {
        headers: {
          "x-api-key": process.env.FRIENDLY_CAPTCHA_API_KEY,
        },
      }
    );

    if (
      captchaResponse?.data?.success &&
      captchaResponse?.data?.data?.challenge?.origin ===
        process.env.FRIENDLY_CAPTCHA_ORIGIN
    ) {
      const contact = await Contact.create({
        fullName,
        email,
        subject,
        message,
        phone,
      });

      return handleResponse(res, 200, "Contact created successfully", contact);
    } else {
      return handleResponse(res, 400, "Captcha verification failed", null);
    }
  } catch (error) {
    return next(error);
  }
};
