const Contact = require("../../models/Contact");
const { paginate } = require("../../utils/utils");
const handleResponse = require("../../utils/response");

exports.getLeads = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const leads = await paginate(
      Contact,
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

    return handleResponse(res, 200, "Leads retrieved", leads);
  } catch (error) {
    return next(error);
  }
};
