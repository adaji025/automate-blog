const Clutch = require("../../models/Clutch");
const { paginate } = require("../../utils/utils");
const handleResponse = require("../../utils/response");

exports.getClutchList = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const list = await paginate(
      Clutch,
      {},
      limit,
      page,
      {
        createdAt: -1,
      },
      {
        _id: 0,
      }
    );

    return handleResponse(res, 200, "Clutch list retrieved", list);
  } catch (error) {
    return next(error);
  }
};
