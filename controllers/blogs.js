const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (req, res) => {
  const blogs = await Blog.find({});

  res.status(200).json(blogs);
});
// res.send("Hello, World!");

blogsRouter.post("/", async (req, res, next) => {
  const { title, author, url, likes } = req.body;

  const newBlog = new Blog({
    title,
    author,
    url,
    likes,
  });

  await newBlog.save().then((blogs) => res.status(201).json(blogs));
});

blogsRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const result = await Blog.findByIdAndDelete(id);
  if (result) res.status(204).end();
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

module.exports = blogsRouter;
