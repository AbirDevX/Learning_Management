const mongoose = require("mongoose");

const CoursesSchema = new mongoose.Schema(
  {
    tropic: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    banner: {
      type: String,
      get: (img) => `${process.env.SERVER_URL}/banner/${img}`,
      required: true,
    },
    adminId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    purchaseIds: { type: [mongoose.Schema.ObjectId], ref: "User", default: [] },
    courseDuration: { type: String, required: true },
    schedule: {
      days: { type: [String], required: true }, // ["Monday", "Wednesday", "Friday"]
      time: { type: String, required: true }, // "9:00 AM - 10:30 AM"
      location: { type: String, required: true }, //"California,USA"
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  }
);

const CoursesModel = mongoose.model("Course", CoursesSchema);

module.exports = CoursesModel;
