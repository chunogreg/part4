const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { userExtractor } = require("../utils/middleware");

blogsRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({}).populate("userId", {
    username: 1,
    name: 1,
  });

  res.status(200).json(blogs);
});
// res.send("Hello, World!");

// const getTokenFrom = (request) => {
//   const authorization = request.get("authorization");
//   if (authorization && authorization.startsWith("Bearer ")) {
//     return authorization.replace("Bearer ", "");
//   }
//   return null;
// };

blogsRouter.post("/", userExtractor, async (req, res, next) => {
  const { title, author, url, likes } = req.body;

  const user = req.user;

  //PREVIOUS EXERCISE IMPLEMENTATION (Refactored into userExtractor middleware):
  // const decodedToken = jwt.verify(req.token, process.env.SECRET);
  // if (!decodedToken.id) {
  //   res.status(400).json({ error: "Invalid token" });
  // }
  // const user = await User.findById(decodedToken.id);

  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const newBlog = new Blog({
    title,
    author,
    url,
    likes: likes || 0,
    userId: user._id,
  });
  const savedBlog = await newBlog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  res.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", userExtractor, async (req, res) => {
  try {
    const id = req.params.id;
    const blog = await Blog.findById(id);

    if (!blog) return res.status(404).json({ error: "Blog not found" });

    //PREVIOUS EXERCISE IMPLEMENTATION (Refactored into userExtractor middleware):
    // const token = jwt.verify(req.token, process.env.SECRET);

    // console.log("TOKEN  IS =========== :", token.id);

    // if (!token.id) {
    //   return res.status(401).json({ error: "Token missing or invalid" });
    // }

    const user = req.user;

    if (user._id.toString() !== blog.userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await Blog.findByIdAndDelete(id);

    if (result) res.status(204).end();
    console.log(`The blog titled '${result.title}' was deleted successfully`);
  } catch (error) {
    console.log("Error deleting blog: ++++++++++++++++++ ", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
});

blogsRouter.put("/:id", async (req, res) => {
  const { title, author, url, likes } = req.body;

  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).end();

  blog.title = title;
  blog.author = author;
  blog.url = url;
  blog.likes = likes;

  const updatedBlog = await blog.save();
  return res.json(updatedBlog);
});

blogsRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const blog = await Blog.findById(id).populate("userId", {
    username: 1,
    name: 1,
  });
  // const token = jwt.verify(req.token, process.env.SECRET);
  // console.log("TOKEN  IS =========== :", token);
  // console.log("BLOG USER IS =========== :", blog.userId);

  if (!blog) return res.status(404).end();
  return res.json(blog);
});

module.exports = blogsRouter;
