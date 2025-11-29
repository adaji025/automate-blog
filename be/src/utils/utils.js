const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

exports.uploadImage = async (imageFilePath, folder, type) => {
  try {
    const resp = await cloudinary.uploader.upload(imageFilePath, {
      resource_type: type || "image",
      folder: folder && folder,
    });
    const {
      format,
      bytes: size,
      secure_url: secureUrl,
      public_id: publicId,
    } = resp;
    return {
      format,
      size,
      secureUrl,
      publicId,
    };
  } catch (error) {
    console.log(error);
    return error;
  }
};

exports.deleteImage = async (imageFilePath) => {
  try {
    const resp = await cloudinary.uploader.destroy(imageFilePath, {
      resource_type: "image",
    });

    return resp;
  } catch (error) {
    return error;
  }
};

exports.capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

exports.isArraySubset = (subset, superset) => {
  const lowerCaseSubset = subset.map((item) => item.toLowerCase());
  const lowerCaseSuperset = superset.flatMap((item) =>
    item.toLowerCase().split(" ")
  );

  return lowerCaseSubset.every((item) => lowerCaseSuperset.includes(item));
};

exports.paginate = async (
  model,
  query,
  limit,
  page,
  sortCriteria = null,
  selectCriteria = null,
  populateOptions = []
) => {
  // Validate and sanitize input
  limit = parseInt(limit) || 10; // Default to 10 if not provided
  page = parseInt(page) || 1; // Default to page 1 if not provided

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Build the query with sorting criteria if provided
  let queryBuilder = model.find(query).skip(skip).limit(limit);

  if (sortCriteria) {
    queryBuilder = queryBuilder.sort(sortCriteria);
  }

  if (selectCriteria) {
    queryBuilder = queryBuilder.select(selectCriteria);
  }

  // Apply populate options if provided
  if (populateOptions && populateOptions.length > 0) {
    populateOptions.forEach((populate) => {
      queryBuilder = queryBuilder.populate(populate);
    });
  }

  // Execute query to get paginated data
  const results = await queryBuilder;

  // Execute query to get total count of all data
  const totalCount = await model.countDocuments(query);

  return {
    totalCount,
    currentPage: page,
    totalPages: Math.ceil(totalCount / limit),
    data: results,
  };
};
