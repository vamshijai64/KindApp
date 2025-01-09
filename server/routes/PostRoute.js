import express from 'express'
import { createPost, deletePost, getPost, getTimelinePosts, likePost, updatePost } from '../controllers/PostController.js'
import authMiddleWare from '../middleware/AuthMiddleware.js'
import multer from 'multer';
const router = express.Router()

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images"); // Save uploaded images to the public/images folder
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname); // Create a unique file name
    },
  });
  
  const upload = multer({ storage: storage });
  


router.post('/',upload.single("file"),createPost)
router.get('/:id', getPost)
router.put('/:id',  updatePost)
router.delete('/:id', deletePost)
router.put('/:id/like', likePost)
router.get('/:id/timeline', getTimelinePosts)

export default router