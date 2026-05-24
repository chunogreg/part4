const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", (req, res) => {
  Blog.find({}).then((blogs) => {
    res.json(blogs);
  });
  // res.send("Hello, World!");
});

blogsRouter.post("/", (req, res) => {
  const { title, author, url, likes } = req.body;

  const newBlog = new Blog({
    title,
    author,
    url,
    likes,
  });
  newBlog.save().then((blogs) => res.status(201).json(blogs));
});

module.exports = blogsRouter;
