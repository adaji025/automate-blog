var mongoose = require("mongoose");
const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

//the slugger plugin breaks on Node 14.21.2
const blogPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: false,
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
      slugPaddingSize: 4,
    },
    assets: [
      {
        url: { type: String, required: false },
        imgId: { type: String, required: false },
      },
    ],
    status: {
      type: String,
      required: true,
      default: "published",
      enum: ["pending", "published"],
    },
    canonicalUrl: { type: String, required: false, default: "" },
  },
  {
    timestamps: true,
  }
);

blogPostSchema.index({
  content: "text",
  title: "text",
});

const BlogPost = new mongoose.model("BlogPost", blogPostSchema);

module.exports = BlogPost;
