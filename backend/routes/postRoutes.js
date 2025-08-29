const express = require('express');
const Post = require('../models/Post'); 
const User = require('../models/User');
const Report = require('../models/Reports');
const authenticate = require('../middleware/authenticate');  
const router = express.Router();

// Create a post (for review, donate, sell)
router.post('/create', authenticate, async (req, res) => {
  const { type, title, bookTitle, author, content, description, price } = req.body;

  if (!type || !author) {
    return res.status(400).json({ error: 'Type and author are required.' });
  }

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
    await newPost.save();
    res.status(201).json(newPost); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creating post.' });
  }
});

// Get all posts (for Dashboard)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'firstName lastName');
    res.json(posts);
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


// Get all wishlisted posts
router.get('/wishlist', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ wishlisted: true }).populate('user', 'firstName lastName');
    res.json(posts);  
  } catch (err) {
    console.error('Error fetching wishlisted posts:', err);
    res.status(500).json({ error: 'Error fetching wishlisted posts.' });
  }
});


// Toggle bookmark for a post for the authenticated user
router.post('/:id/bookmark', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const postId = req.params.id;
    const existingIndex = user.bookmarks.findIndex(p => p.toString() === postId);

    if (existingIndex === -1) {
      user.bookmarks.push(postId);
      await user.save();
      return res.json({ message: 'Bookmarked', bookmarked: true });
    } else {
      user.bookmarks.splice(existingIndex, 1);
      await user.save();
      return res.json({ message: 'Removed bookmark', bookmarked: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating bookmark.' });
  }
});

// Get all bookmarked posts for the authenticated user
router.get('/bookmarks', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'bookmarks',
        populate: { path: 'user', select: 'firstName lastName' },
      });
    const posts = user?.bookmarks || [];
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching bookmarked posts.' });
  }
});

// Edit a post (owner or admin)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the authenticated user owns the post or is an admin
    const isOwner = post.user?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not allowed to edit this post' });
    }

    const { type, title, bookTitle, author, content, description, price } = req.body;
    
    if (!type || !author) {
      return res.status(400).json({ error: 'Type and author are required.' });
    }

    if (type === 'review' && (!title || !content)) {
      return res.status(400).json({ error: 'Title and content are required for reviews.' });
    }

    if ((type === 'donate' || type === 'sell') && (!bookTitle || !description)) {
      return res.status(400).json({ error: 'Book title and description are required for donate/sell posts.' });
    }

    if (type === 'sell' && !price) {
      return res.status(400).json({ error: 'Price is required for sell posts.' });
    }

    // Update the post
    post.type = type;
    post.title = title || null;
    post.bookTitle = bookTitle || null;
    post.author = author;
    post.content = content || null;
    post.description = description || null;
    post.price = price || null;

    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating post.' });
  }
});



// Delete a post (owner or admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Find the post by ID
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if the authenticated user owns the post or is an admin
    const isOwner = post.user?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin'; // Assuming you have a 'role' field in User schema
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not allowed to delete this post' });
    }

    // Remove the post
    await Post.deleteOne({ _id: post._id });

    // OPTIONAL: Cleanup User's bookmarks, wishlist, and likedPosts arrays
    const postId = post._id;
    await User.updateMany({}, { $pull: { bookmarks: postId, wishlist: postId, likedPosts: postId } });

    res.json({ message: 'Post deleted successfully', postId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting post.' });
  }
});



// User reports a post
router.post('/:id/report', authenticate, async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ error: 'Reason is required' });

  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const report = await Report.create({
    post: post._id,
    reportedBy: req.user.id,
    reason,
  });

  res.status(201).json({ message: 'Reported', report });
});

module.exports = router;