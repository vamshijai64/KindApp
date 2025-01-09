import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    // userId: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true }, // Reference to UserModel
    desc: {type: String, required : true},
    likes: [],
    createdAt: {
      type: Date,
      default: new Date(),
    },
    image: String,
  },
  {
    timestamps: true,
  }
);

var PostModel = mongoose.model("Posts", postSchema);

export default PostModel;
