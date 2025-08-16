const express = require('express');
const Post = require('../models/post');
const authenticate = require('../middleware/authenticate');  // Middleware to verify user
const router = express.Router();

// Create a post
router.post('/create', authenticate, async (req, res) => {
  const { title, author, content } = req.body;

  if (!title || !author || !content) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newPost = new Post({
    title,
    author,
    content,
    user: req.user.id,  // Use the logged-in user’s ID
  });

  try {
    await newPost.save();
    res.status(201).json(newPost);  // Return the created post
  } catch (err) {
    res.status(500).json({ error: 'Error creating post.' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'firstName lastName');  // Populate user data with their name
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching posts.' });
  }
});

// Get posts by user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).populate('user', 'firstName lastName');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user posts.' });
  }
});

module.exports = router;



// // like a post
// router.post('/:id/like', async (req, res) => {
//   const userId = req.body.userId; // Get userId from body or token

//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) return res.status(404).json({ error: 'Post not found' });

//     // Toggle like
//     if (post.likes.includes(userId)) {
//       post.likes = post.likes.filter(id => id !== userId);
//     } else {
//       post.likes.push(userId);
//     }

//     const updatedPost = await post.save();
//     res.json(updatedPost);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to like post' });
//   }
// });

// //fetch liked posts
// router.get('/likes/:userId', async (req, res) => {
//   try {
//     const posts = await Post.find({ likes: req.params.userId });
//     res.json(posts);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch liked posts' });
//   }
// });

// // bookmark a post
// router.post('/:id/bookmark', async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     if (!post) return res.status(404).json({ error: 'Post not found' });

//     post.bookmarks += 1;
//     const updatedPost = await post.save();
//     res.json(updatedPost);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to bookmark post' });
//   }
// });

// module.exports = router;
