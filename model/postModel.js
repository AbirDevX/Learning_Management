const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    banner: {
      type: String,
      required: true,
      get: (img) => `${process.env.SERVER_URL}post/${img}`,
    },
    subTitle: { type: String, required: true },
    description: { type: String, required: true },
    publishedDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    adminId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    commentIds: {
      type: [mongoose.Schema.ObjectId],
      ref: "Comment",
      default: [],
    },
    like: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { getters: true } }
);
const PostModel = mongoose.model("Post", PostSchema);
module.exports = { PostModel };
