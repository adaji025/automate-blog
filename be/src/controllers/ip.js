const apiip = require("apiip.net")(process.env.APIIP_API_KEY, { ssl: false });
const handleResponse = require("../utils/response");

exports.getLocationFromIp = async (req, res, next) => {
  try {
    const { ip } = req.body;

    const data = await apiip.getLocation({
      ip,
      fields:
        "city,countryName,countryCode,regionName,regionCode,latitude,longitude,timeZone,phoneCode",
    });

    return handleResponse(res, 200, "Location fetched successfully", data);
  } catch (error) {
    return next(error);
  }
};
