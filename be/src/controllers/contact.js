const Contact = require("../models/Contact");
const handleResponse = require("../utils/response");
const axios = require("axios");

exports.createContact = async (req, res, next) => {
  try {
    const { fullName, email, subject, message, phone, captcha } = req.body;

    // Only verify captcha if it's provided
    if (captcha) {
      try {
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
          !captchaResponse?.data?.success ||
          captchaResponse?.data?.data?.challenge?.origin !==
            process.env.FRIENDLY_CAPTCHA_ORIGIN
        ) {
          return handleResponse(res, 400, "Captcha verification failed", null);
        }
      } catch (captchaError) {
        // If captcha verification fails, return error
        return handleResponse(res, 400, "Captcha verification failed", null);
      }
    }

    // Create contact if captcha is not provided or if captcha verification succeeded
    const contact = await Contact.create({
      fullName,
      email,
      subject,
      message,
      phone,
    });

    return handleResponse(res, 200, "Contact created successfully", contact);
  } catch (error) {
    return next(error);
  }
};
