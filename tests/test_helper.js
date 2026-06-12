const Blog = require("../models/blog");

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

module.exports = { initiaBlogs, blogsInDb };
