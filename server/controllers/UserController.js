import UserModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });




export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
  
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

   
    const { password, ...otherDetails } = user._doc;
 
  res.status(200).json({
    ...otherDetails,
    dailyStreak: user.dailyStreak || { count: 0, lastUpdated: null },
  });

   
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {

  try {
    let users = await UserModel.find();
    users = users.map((user)=>{
      const {password, ...otherDetails} = user._doc
      return otherDetails
    })
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json(error);
  }
};



export const updateUser = async (req, res) => {
  const id = req.params.id;
  const { _id, currentUserAdmin, password } = req.body;

  // Validate if the user can update this account
  if (id === _id || currentUserAdmin) {
    try {
      // Check if there is a file in the request
      let updatedFields = { ...req.body };


  //new line
      // Check if a profile picture is uploaded
      if (req.file) {
        updatedFields.profilePicture =` public/images/${req.file.filename}`; // Save the relative path to the file
      }

      // Hash password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updatedFields.password = await bcrypt.hash(password, salt);
      }

      // Update the user in the database
      const user = await UserModel.findByIdAndUpdate(id, updatedFields, {
        new: true,
      });

      // Generate a new token
      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.JWTKEY,
        { expiresIn: "1h" }
      );

      res.status(200).json({ user, token });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(403).json("Access Denied! You can update only your own Account.");
  }
};
export const uploadProfilePicture=upload.single("profilePicture")

// Delete a user
export const deleteUser = async (req, res) => {
  const id = req.params.id;

  const { currentUserId, currentUserAdmin } = req.body;

  if (currentUserId == id || currentUserAdmin) {
    try {
      await UserModel.findByIdAndDelete(id);
      res.status(200).json("User Deleted Successfully!");
    } catch (error) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("Access Denied!");
  }
};

// Follow a User
// changed
export const followUser = async (req, res) => {
  const id = req.params.id;
  console.log(req.params.id, req.body);

  const { _id } = req.body;

  console.log(id, _id);

  if (_id == id) {
    res.status(403).json("Action Forbidden");
  } 
  else 
  {
    try {

      const followUser = await UserModel.findById(id);
      const followingUser = await UserModel.findById(_id);
      
      //new line
      if (!followUser || !followingUser) {
        return res.status(404).json({ error: "User not found" });
      }

    // Check if already following
   if (!followUser.followers.includes(_id)) {
      await followUser.updateOne({ $push: { followers: _id } });
      await followingUser.updateOne({ $push: { following: id } });

    

         res.status(200).json("Followed successfully");

      } else {
        res.status(403).json("you are already following this id");
      }
    } catch (error) {
      console.log(error)
      res.status(500).json(error);
    }
  }
};

// Unfollow a User
// changed
export const unfollowUser = async (req, res) => {
  const id = req.params.id;
  const { _id } = req.body;

  if(_id === id)
  {
    res.status(403).json("Action Forbidden")
  }
  else{
    try {
      const unFollowUser = await UserModel.findById(id)
      const unFollowingUser = await UserModel.findById(_id)
    
      //new line
      if (!unFollowUser || !unFollowingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      if (unFollowUser.followers.includes(_id))
      {
        await unFollowUser.updateOne({$pull : {followers: _id}})
        await unFollowingUser.updateOne({$pull : {following: id}})

        res.status(200).json("Unfollowed Successfully!")
      }
      else{
        res.status(403).json("You are not following this User")
      }
    } catch (error) {
      res.status(500).json(error)
    }
  }
};

export const updateStreak = async (userId) => {

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const now = new Date();
  const lastUpdated = user.dailyStreak.lastUpdated || null;

  if (!lastUpdated || now - lastUpdated >= 24 * 60 * 60 * 1000) {
    user.dailyStreak.count += 1; // Increment streak
    user.dailyStreak.lastUpdated = now;
    await user.save(); // Ensure changes are saved
  }

  return user.dailyStreak;
};

export const addNotification = async (req, res) => {
  const { userId, type, message } = req.body;
  try {
      const user = await UserModel.findById(userId);
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      const notification = { type, message, createdAt: new Date() };
      await user.updateOne({ $push: { notifications: notification } });

      // Trigger a Pusher event
      pusher.trigger(`user-${userId}`, "notification", notification);

      res.status(201).json({ message: 'Notification added successfully', notification });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
  }
}




