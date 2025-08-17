const express = require('express');
const Post = require('../models/Post');  // Ensure you have the correct import
const authenticate = require('../middleware/authenticate');  // Authentication middleware
const router = express.Router();

// Create a post (for review, donate, sell)
router.post('/create', authenticate, async (req, res) => {
  const { type, title, bookTitle, author, content, description, price } = req.body;

  // Ensure type and author are provided
  if (!type || !author) {
    return res.status(400).json({ error: 'Type and author are required.' });
  }

  // Additional validations based on post type
  if (type === 'review' && (!title || !content)) {
    return res.status(400).json({ error: 'Title and content are required for reviews.' });
  }

  if ((type === 'donate' || type === 'sell') && (!bookTitle || !description)) {
    return res.status(400).json({ error: 'Book title and description are required for donate/sell posts.' });
  }

  if (type === 'sell' && !price) {
    return res.status(400).json({ error: 'Price is required for sell posts.' });
  }

  // Create the new post
  const newPost = new Post({
    type,
    title: title || null,
    bookTitle: bookTitle || null,
    author,
    content: content || null,
    description: description || null,
    price: price || null,
    user: req.user.id,  // Associate the post with the authenticated user
  });

  try {
    // Save the post in the database
    await newPost.save();
    res.status(201).json(newPost);  // Return the created post as the response
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating post.' });
  }
});

// Get all posts (for Dashboard)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'firstName lastName');  // Populate user data
    res.json(posts);  // Send posts to the frontend
  } catch (err) {
    res.status(500).json({ error: 'Error fetching posts.' });
  }
});

// Get posts by user (for User Dashboard)
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).populate('user', 'firstName lastName');
    res.json(posts);  // Return posts for the specified user
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user posts.' });
  }
});


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

// Get all wishlisted posts
router.get('/wishlist', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ wishlisted: true }).populate('user', 'firstName lastName');
    res.json(posts);  // Return the wishlisted posts
  } catch (err) {
    console.error('Error fetching wishlisted posts:', err);
    res.status(500).json({ error: 'Error fetching wishlisted posts.' });
  }
});


// Get all bookmarked posts
router.get('/bookmarks', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ bookmarked: true }).populate('user', 'firstName lastName');
    res.json(posts);  // Return the bookmarked posts
  } catch (err) {
    res.status(500).json({ error: 'Error fetching bookmarked posts.' });
  }
});

module.exports = router;
