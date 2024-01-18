const { mongo, Mongoose } = require("mongoose");
const { default: mongoose } = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    coursesIds: { type: [mongoose.Schema.ObjectId], ref: "Course", default: [] },
    avatar: {
      type: String,
      default: "user.png",
      get: (avatar) => `${process.env.SERVER_URL}${avatar}`,
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
