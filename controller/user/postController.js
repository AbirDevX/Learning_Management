const { StatusCodes } = require("http-status-codes");
const { HttpException } = require("../../config/httpException");
const { CommentModel } = require("../../model/commentModel");
const { PostModel } = require("../../model/postModel");

const renderAllPost = async (req, res) => {
  if (req.cookies && !req.cookies["user_token"]) {
    return res.redirect("/login");
  }
  try {
    const posts = await PostModel.find({ isActive: true });
    return res.render("user/posts", {
      error: "",
      title: "Blog Page",
      value: "",
      posts,
      user: req.user,
      url: req.url,
    });
  } catch (error) {
    console.log(error?.message);
    return res.redirect("/login");
  }
};
const renderSinglePostPage = async (req, res) => {
  const param = req.params;
  if (req.cookies && !req.cookies["user_token"]) {
    return res.redirect("/login");
  }
  try {
    if (!param.id) throw new Error("Bad Request");
    const post = await PostModel.findOne({
      _id: param.id,
      isActive: true,
    });
    const relatedPost = await PostModel.find({
      isActive: true,
      _id: { $ne: param.id },
    });
    const aggregationPostComment = await PostModel.aggregate([
      { $match: { _id: post._id } },
      {
        $lookup: {
          from: "comments",
          localField: "commentIds",
          foreignField: "_id",
          as: "commentInfo",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "authInfo",
              },
            },
            {
              $project: {
                email: 0,
                password: 0,
              },
            },
          ],
        },
      },
      {
        $project: {
          title: 0,
          banner: 0,
          subTitle: 0,
          description: 0,
          publishedDate: 0,
          isActive: 0,
          adminId: 0,
          like: 0,
          __v: 0,
          updatedAt: 0,
          commentIds: 0,
        },
      },
    ]);

    return res.render("user/posts/singlePost", {
      error: "",
      title: "Post Page",
      flashMsg: {
        error: req.flash("error"),
        success: req.flash("success"),
        msg: req.flash("msg"),
      },
      post,
      comments: aggregationPostComment[0]?.commentInfo,
      relatedPost,
      user: req.user,
      url: req.url,
    });
  } catch (error) {
    console.log(error?.message);
    return res.redirect("/login");
  }
};

const addComment = async (req, res) => {
  const param = req.params;
  const payload = req.body;
  if (req.cookies && !req.cookies["user_token"]) {
    return res.redirect("/login");
  }
  try {
    const commentModel = new CommentModel({
      body: payload.comment,
      userId: req?.user?.id,
      postId: param.id,
    });
    const newComment = await commentModel.save();
    await PostModel.findByIdAndUpdate(newComment.postId, {
      $push: { commentIds: newComment._id },
    });
    req.flash("success", "Comment added successFully");
    return res.redirect(`/post/${param.id}#commentSection`);
  } catch (error) {
    console.log(error?.message);
    req.flash("error", "Comment added failed..! try again!");
    return res.redirect(`/post/${param.id}#commentSection`);
  }
};
const addLike = async (req, res) => {
  const param = req.params;
  if (req.cookies && !req.cookies["user_token"]) {
    return res.redirect("/login");
  }
  try {
    if (!param.id)
      throw new HttpException(StatusCodes.BAD_REQUEST, "Bad request..!");
    const post = await PostModel.findById(param?.id);
    if (!post) throw new HttpException(StatusCodes.NOT_FOUND, "NOT FOUND..!");
    const updatedPost = await PostModel.findByIdAndUpdate(
      post._id,
      { like: post.like + 1 },
      { new: true }
    );

    return res.status(StatusCodes.OK).json({
      message: "success",
      status: StatusCodes.OK,
      like: updatedPost.like,
    });
  } catch (error) {
    console.log(error?.message);
    return res.status(error?.status || StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: error?.status || StatusCodes.INTERNAL_SERVER_ERROR,
      message: error?.message,
    });
  }
};

module.exports = { renderAllPost, renderSinglePostPage, addComment, addLike };
