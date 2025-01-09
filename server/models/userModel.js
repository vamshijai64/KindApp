import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    
    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
   profilePicture: String,
   
    about: String,
    
    worksAt: String,
    relationship: String,
    country: String,
    followers: [],
    following: [],
    dailyStreak: {
      count: { type: Number, default: 0 }, // Number of days in streak
      lastUpdated: { type: Date }, // Last streak update
    },
    notifications: [
      {
        type: {
          type: String, // e.g., "like", "follow", "comment"
        },
        message: {
          type: String, // Notification message
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("Users", UserSchema);
export default UserModel;
