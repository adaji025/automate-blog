const handleResponse = require("../utils/response");
// const axios = require("axios");
const Clutch = require("../models/Clutch");

exports.createClutch = async (req, res, next) => {
  try {
    const { fullName, email, service, profileLink } = req.body;

    // const captchaResponse = await axios.post(
    //   "https://global.frcapi.com/api/v2/captcha/siteverify",
    //   {
    //     sitekey: process.env.FRIENDLY_CAPTCHA_SITE_KEY,
    //     response: captcha,
    //   },
    //   {
    //     headers: {
    //       "x-api-key": process.env.FRIENDLY_CAPTCHA_API_KEY,
    //     },
    //   }
    // );

    // console.log(
    //   captchaResponse?.data?.success,
    //   captchaResponse?.data?.data?.challenge?.origin
    // );

    // if (
    //   captchaResponse?.data?.success &&
    //   captchaResponse?.data?.data?.challenge?.origin ===
    //     process.env.FRIENDLY_CAPTCHA_ORIGIN_CLUTCH
    // ) {
    const clutch = await Clutch.create({
      fullName,
      email,
      service,
      profileLink,
    });

    return handleResponse(res, 200, "Clutch created successfully", clutch);
    // } else {
    //   return handleResponse(res, 400, "Captcha verification failed", null);
    // }
  } catch (error) {
    return next(error);
  }
};
