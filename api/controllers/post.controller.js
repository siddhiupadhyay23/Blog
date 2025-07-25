import Post from '../models/post.model.js';
import { errorHandler } from '../utils/error.js';

export const create = async (req, res, next) => {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create a post'));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }
  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  // Check if user is admin AND (either they own the post OR they're admin)
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  
  try {
    // First check if the post exists
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return next(errorHandler(404, 'Post not found'));
    }

    // Check if user owns the post or is admin
    if (req.user.id !== req.params.userId && !req.user.isAdmin) {
      return next(errorHandler(403, 'You can only delete your own posts'));
    }

    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ message: 'The post has been deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin && req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this post'));
  }
  
  try {
    // Check if post exists first
    const existingPost = await Post.findById(req.params.postId);
    if (!existingPost) {
      return next(errorHandler(404, 'Post not found'));
    }

    // Generate new slug if title is being updated
    let updateData = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      image: req.body.image,
    };

    // If title is being updated, regenerate slug
    if (req.body.title && req.body.title !== existingPost.title) {
      updateData.slug = req.body.title
        .split(' ')
        .join('-')
        .toLowerCase()
        .replace(/[^a-zA-Z0-9-]/g, '');
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      { $set: updateData },
      { new: true }
    );
    
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};