const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Post = require("../models/Post");
const verify = require("../middleware/verifyToken");

// Signup
router.post("/signup", async (req, res) => {
  const { username, name, age, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).send("Email already exists");

  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(password, salt);

  const user = new User({ username, name, age, email, password: hashedPass });
  await user.save();
  res.send("Signup Successful");
});

// Login
router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User not found");

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Wrong Password");

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.header("auth-token", token).send({ token });
});

// Create Post
router.post("/post", verify, async (req, res) => {
  const post = new Post({ user: req.user._id, content: req.body.content });
  await post.save();
  res.send("Post created");
});

// Get all Tweets
router.get("/tweets", async (req, res) => {
  const posts = await Post.find().populate("user", "username name");
  res.send(posts);
});

// Get Your Tweets
router.get("/yourtweets", verify, async (req, res) => {
  const posts = await Post.find({ user: req.user._id }).populate("user");
  res.send(posts);
});

// Like a Post
router.post("/like/:id", verify, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post.likes.includes(req.user._id)) {
    post.likes.push(req.user._id);
    await post.save();
  }
  res.send("Post liked");
});

// Update Post
router.put("/update/:id", verify, async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { content: req.body.content },
    { new: true }
  );
  if (!post) return res.status(404).send("Post not found or unauthorized");
  res.send(post);
});

// Delete Post
router.delete("/delete/:id", verify, async (req, res) => {
  const post = await Post.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!post) return res.status(404).send("Post not found or unauthorized");
  res.send("Post deleted");
});

module.exports = router;
