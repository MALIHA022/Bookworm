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
    user: req.user.id,
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

// Search posts by book title, post title, or author
router.get('/search', async (req, res) => {
  try {
    const { q, type } = req.query;
    
    let searchQuery = {};

    if (type && type !== 'all') {
      searchQuery.type = type;
    }
    
    if (q && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
      searchQuery.$or = [
        { bookTitle: searchRegex },
        { title: searchRegex },
        { author: searchRegex }
      ];
    }
    
    const posts = await Post.find(searchQuery).populate('user', 'firstName lastName');
    res.json(posts);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Error searching posts.' });
  }
});

// Get posts by user (for User Dashboard)
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId }).populate('user', 'firstName lastName');
    res.json(posts);  
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user posts.' });
  }
});


// Toggle bookmark 
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

// Check if a post is bookmarked by the user
router.get('/:id/bookmarked', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('bookmarks');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const postId = req.params.id;
    const isBookmarked = user.bookmarks.some(p => p.toString() === postId);
    res.json({ bookmarked: isBookmarked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking bookmarks.' });
  }
});

// Get all bookmarked posts
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


// Toggle wishlist 
router.post('/:id/wishlist', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const postId = req.params.id;
    const existingIndex = user.wishlist.findIndex(p => p.toString() === postId);

    if (existingIndex === -1) {
      user.wishlist.push(postId);
      await user.save();
      return res.json({ message: 'Added to wishlist', wishlisted: true });
    } else {
      user.wishlist.splice(existingIndex, 1);
      await user.save();
      return res.json({ message: 'Removed from wishlist', wishlisted: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating wishlist.' });
  }
});

// Check if a post is wishlisted
router.get('/:id/wishlisted', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('wishlist');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const postId = req.params.id;
    const isWishlisted = user.wishlist.some(p => p.toString() === postId);
    res.json({ wishlisted: isWishlisted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking wishlist.' });
  }
});

// Get all wishlisted posts
router.get('/wishlist', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'wishlist',
        populate: { path: 'user', select: 'firstName lastName email' },
      });
    const posts = user?.wishlist || [];
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching wishlisted posts.' });
  }
});

// Toggle like and update like count
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user.id).select('likedPosts');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (!Array.isArray(user.likedPosts)) user.likedPosts = [];
    const idx = user.likedPosts.findIndex(p => p.toString() === postId);
    let liked;
    if (idx === -1) {
      user.likedPosts.push(postId);
      post.likes = (post.likes || 0) + 1;
      liked = true;
    } else {
      user.likedPosts.splice(idx, 1);
      post.likes = Math.max((post.likes || 0) - 1, 0);
      liked = false;
    }

    await Promise.all([user.save(), post.save()]);

    res.json({ liked, likes: post.likes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating like.' });
  }
});

// Check if liked
router.get('/:id/liked', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('likedPosts');
    if (!user) return res.status(404).json({ error: 'User not found' });
    const postId = req.params.id;
    const isLiked = user.likedPosts.some(p => p.toString() === postId);
    res.json({ liked: isLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error checking like.' });
  }
});

// Edit a post
router.put('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

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

    // Update post
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

// Delete a post
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isOwner = post.user?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin'; 
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not allowed to delete this post' });
    }

    // Remove the post
    await Post.deleteOne({ _id: post._id });

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
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Reason is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    // Check if already reported
    const existingReport = await Report.findOne({
      post: post._id,
      reportedBy: req.user.id
    });

    if (existingReport) {
      return res.status(400).json({ error: 'You have already reported this post' });
    }

    const report = await Report.create({
      post: post._id,
      reportedBy: req.user.id,
      reason,
      status: 'pending'
    });

    res.status(201).json({ message: 'Post reported successfully', report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error reporting post' });
  }
});

// Mark not interested 
router.post('/:id/not-interested', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notInterested');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const postId = req.params.id;
    const already = user.notInterested?.some(p => p.toString() === postId);
    if (!already) {
      user.notInterested.push(postId);
      await user.save();
    }
    return res.json({ message: 'Post marked as not interested', notInterested: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error marking post as not interested.' });
  }
});

// excluding notInterested posts
router.get('/feed', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notInterested');
    const excluded = user?.notInterested || [];
    const posts = await Post.find({ _id: { $nin: excluded } })
      .populate('user', 'firstName lastName');
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching feed.' });
  }
});

module.exports = router;