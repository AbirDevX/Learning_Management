const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    isActive: { type: Boolean, default: true },
    body: { type: String, required: true },
    like: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    postId: { type: mongoose.Schema.ObjectId, ref: "Post", required: true },
  },
  { timestamps: true }
);
 
const CommentModel = mongoose.model("Comment", CommentSchema);
module.exports = { CommentModel };
