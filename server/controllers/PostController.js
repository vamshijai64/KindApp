import PostModel from "../models/postModel.js";
import UserModel from "../models/userModel.js";
import mongoose from "mongoose";
import { updateStreak } from "./UserController.js";



export const createPost = async (req, res) => {
  try {
    const { userId, desc } = req.body;

    // Validate required fields
    if (!userId || !desc) {
      return res.status(400).json({ error: "userId and desc are required." });
    }

    const updatedStreak = await updateStreak(userId);
    // Create the post
    const newPost = new PostModel({
      userId,
      desc,
      image: req.file ? `images
      /${req.file.filename}` : null,
    });
    const savedPost = await newPost.save();
    res.status(200).json({ savedPost, dailyStreak: updatedStreak });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// get a post

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await PostModel.findById(id);
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
};

// update post
export const updatePost = async (req, res) => {
  
  const postId = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(postId);
    if (post.userId === userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("Post updated!");
    } else {
      res.status(403).json("Authentication failed");
    }
  } catch (error) {}
};

// delete a post
export const deletePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;

  try {
    const post = await PostModel.findById(id);
    if (post.userId === userId) {
      await post.deleteOne();
      res.status(200).json("Post deleted.");
    } else {
      res.status(403).json("Action forbidden");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

// like/dislike a post
export const likePost = async (req, res) => {
  const id = req.params.id;
  const { userId } = req.body;
  try {
    const post = await PostModel.findById(id);
  

    if (post.likes.includes(userId)) {
      await post.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Post disliked");
    } else {
      await post.updateOne({ $push: { likes: userId } });

     

      res.status(200).json("Post liked");
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getTimelinePosts = async (req, res) => {
  const userId = req.params.id; // Current user's ID

  try {
    
    // Fetch all posts and populate username & profilePicture from UserModel
    const timelinePosts = await PostModel.find({})
      .sort({ createdAt: -1 }) 
      .populate("userId", "username profilePicture"); 

    res.status(200).json(timelinePosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch timeline posts" });
  }
};
