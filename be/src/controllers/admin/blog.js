const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
const blogData = require("../../constants/data");
const BlogPost = require("../../models/admin/BlogPost");
const { fileType } = require("../../utils/filetype");
const handleResponse = require("../../utils/response");
const { uploadImage, deleteImage, paginate } = require("../../utils/utils");
const { extractPublicId } = require("cloudinary-build-url");
const generateSitemap = require("../../sitemap");
const {
  upsertArticles,
  updateAnArticleInPinecone,
  deleteAnArticleFromPinecone,
} = require("../../utils/scraper");

exports.createPost = async (req, res, next) => {
  try {
    const token = req.user;
    const { title, content, status, duration } = req.body;

    const assets = req?.files?.assets;

    const dataToCreate = {
      title,
      content,
      status,
      duration,
    };

    if (assets && assets?.length > 0) {
      //upload each of the assets to cloudinary
      const assetResArr = assets.map(async (v) => {
        const resp = await uploadImage(
          v.tempFilePath,
          "bles-software-blog",
          fileType[v.mimetype] || "raw"
        );
        return resp;
      });

      const assetResArrData = await Promise.all(assetResArr);

      if (assetResArrData && assetResArrData.length) {
        dataToCreate["assets"] = assetResArrData.map((v) => {
          return { url: v.secureUrl, imgId: v.publicId };
        });
      }
    }

    // create the blog
    const createdBlogPost = await BlogPost.create({
      ...dataToCreate,
      authorId: token._id,
    });

    // update sitemap
    await generateSitemap();

    // upsert to pinecone
    await upsertArticles([createdBlogPost]);

    return handleResponse(res, 201, "Blog post created", createdBlogPost);
  } catch (error) {
    return next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const token = req.user;
    const { blogPostId } = req.params;
    const { title, content, status, duration } = req.body;

    const existingPost = await BlogPost.findById(blogPostId);

    if (!existingPost) {
      return handleResponse(
        res,
        400,
        "Blog post with the provided ID not found"
      );
    }

    const assets = req?.files?.assets;

    const dataToUpdate = {
      title,
      content,
      status,
      duration,
    };

    if (assets && assets?.length > 0) {
      // firstly delete existing blog image
      const existingAssetArray = existingPost?.assets;

      if (existingAssetArray?.length > 0) {
        const deleteAssets = existingAssetArray.map(async (eachImage) => {
          await deleteImage(eachImage?.imgId);
          return;
        });

        await Promise.all(deleteAssets);
      }

      // then
      //upload each of the assets to cloudinary
      const assetResArr = assets.map(async (v) => {
        const resp = await uploadImage(
          v.tempFilePath,
          "bles-software-blog",
          fileType[v.mimetype] || "raw"
        );
        return resp;
      });

      const assetResArrData = await Promise.all(assetResArr);

      if (assetResArrData && assetResArrData.length) {
        dataToUpdate["assets"] = assetResArrData.map((v) => {
          return { url: v.secureUrl, imgId: v.publicId };
        });
      }
    }

    // update the blog
    const updatedBlogPost = await BlogPost.findByIdAndUpdate(
      blogPostId,
      {
        $set: {
          ...dataToUpdate,
          authorId: token._id,
        },
      },
      { new: true }
    );

    // update sitemap
    await generateSitemap();

    // upsert to pinecone
    await updateAnArticleInPinecone(blogPostId, updatedBlogPost);

    return handleResponse(res, 201, "Blog post updated", updatedBlogPost);
  } catch (error) {
    return next(error);
  }
};

exports.getSingleBlogPost = async (req, res, next) => {
  try {
    const { blogPostId } = req.params;

    const blogPost = await BlogPost.findById(blogPostId).select({
      authorId: 0,
    });

    return handleResponse(res, 200, "Blog post retrieved", blogPost);
  } catch (error) {
    return next(error);
  }
};

exports.getAllBlogPost = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const blogPosts = await paginate(
      BlogPost,
      {},
      limit,
      page,
      {
        createdAt: -1,
      },
      {
        authorId: 0,
      },
      []
    );

    return handleResponse(res, 200, "Blog posts retrieved", blogPosts);
  } catch (error) {
    return next(error);
  }
};

exports.deleteBlogPost = async (req, res, next) => {
  try {
    const { blogPostId } = req.params;

    const blog = await BlogPost.findById(blogPostId);

    if (!blog) {
      return handleResponse(res, 400, "Blog does not exist");
    }

    const assetsArray = blog?.assets;

    if (assetsArray && assetsArray?.length > 0) {
      const deleteAssets = assetsArray.map(async (eachImage) => {
        await deleteImage(eachImage?.imgId);
        return;
      });

      await Promise.all(deleteAssets);
      await BlogPost.findByIdAndDelete(blogPostId);
    }

    // update sitemap
    await generateSitemap();

    // delete from pinecone
    await deleteAnArticleFromPinecone(blogPostId);

    return handleResponse(res, 200, "Blog post deleted");
  } catch (error) {
    return next(error);
  }
};

exports.bulkCreatePost = async (req, res, next) => {
  try {
    const blogArray = blogData.map((eachBlog) => {
      return {
        authorId: req.user._id,
        title: eachBlog.title,
        slug: eachBlog.slug,
        content: eachBlog.content,
        createdAt: dayjs(eachBlog.date, "MMMM DD,YYYY").toDate(),
        duration: eachBlog.duration,
        assets: [
          { url: eachBlog.image, imgId: extractPublicId(eachBlog.image) },
        ],
      };
    });

    const data = await BlogPost.insertMany(blogArray);
    return handleResponse(res, 200, "Success", data);
  } catch (error) {
    return next(error);
  }
};
