const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const initiaBlogs = [
  {
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture…",
    likes: 0,
  },

  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },

  {
    title: "Lights on the Sea",
    author: "Miquel Reina",
    url: "https://www.miquelreinabooks.com/",
    likes: 12,
  },
];

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

const generateTestToken = (customPayload = {}) => {
  defaultPayload = {
    username: "testuser",
    id: "64a7e0f3c1b2f5e6d8a9b0c1",
  };
  const payload = { ...defaultPayload, ...customPayload };
  return jwt.sign(payload, process.env.SECRET || "secret", { expiresIn: "1h" });
};

module.exports = { initiaBlogs, blogsInDb, usersInDb, generateTestToken };
