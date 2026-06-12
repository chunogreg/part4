require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);

const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const api = supertest(app);
const helper = require("./test_helper");
const Blog = require("../models/blog");

beforeEach(async () => {
  await Blog.deleteMany({});

  let blogObj = new Blog(helper.initiaBlogs[0]);
  await blogObj.save();

  blogObj = new Blog(helper.initiaBlogs[1]);
  await blogObj.save();

  blogObj = new Blog(helper.initiaBlogs[2]);
  await blogObj.save();
});

test("return all blogs", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("content-Type", /application\/json/);
});

test("every blog is returned", async () => {
  const res = await api.get("/api/blogs");
  assert.strictEqual(res.body.length, helper.initiaBlogs.length);
});

test("a specific blog is within the returned blogs", async () => {
  const result = await helper.blogsInDb();
  const blogToTest = result[0];

  const titles = result.map((b) => b.title);

  console.log("THE BLOG TO TEST  ====   ", blogToTest);
  assert(titles.includes(blogToTest.title));
});

test("verifies that id property of the blog posts is named id", async () => {
  const res = await api.get("/api/blogs");

  const blog = res.body.filter((b) => b.hasOwnProperty("id"));

  console.log(
    "BLOGS HAS ID ======",
    res.body.map((b) => b),
  );

  assert.strictEqual(blog.length, res.body.length, "blog is missing in id");
});

test("verify that POST request creates a new blog", async () => {
  const newBlog = {
    title: "React patterns xxxxxxxxxx",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  };

  await api.post("/api/blogs").send(newBlog).expect(201);
  const blogsAtEnd = await helper.blogsInDb();

  assert.strictEqual(helper.initiaBlogs.length + 1, blogsAtEnd.length);
});

test("Likes property defaults to 0 if ommitted", async () => {
  const newBlog = {
    title: "React patterns xxxxxxxxxx",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
  };

  const res = await api.post("/api/blogs").send(newBlog);

  const returnedBlogs = await helper.blogsInDb();
  console.log("RETURED BLOGS ARE ===== ", returnedBlogs);
  const blogWithoutId = returnedBlogs.find(
    (b) => b.title === "React patterns xxxxxxxxxx",
  );

  assert.strictEqual(blogWithoutId.likes, 0);
});

test("Blog without title property is not added", async () => {
  const newBlog = {
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 8,
  };

  await api.post("/api/blogs").send(newBlog).expect(400);

  const res = await api.get("/api/blogs");

  assert.strictEqual(res.body.length, helper.initiaBlogs.length);
});

test("a single Blog can be deleted", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[1];

  const res = await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

  const remainingBlogs = await helper.blogsInDb();

  const blogIds = remainingBlogs.map((b) => b.id);
  //assert(blogIds.includes(blogToDelete.id, false));
  assert(!blogIds.includes(blogToDelete.id));

  assert.strictEqual(remainingBlogs.length, helper.initiaBlogs.length - 1);
});

test("update a single Blog's information", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToUpdate = blogsAtStart[1];

  const allLikes = blogsAtStart.map((l) => l.likes);
  const totalLikes = allLikes.reduce((sum, l) => sum + l, 0);

  //console.log("BEFORE UPDATE = ", blogToUpdate.likes);

  const updatedBlog = {
    title: blogToUpdate.title,
    author: blogToUpdate.author,
    url: blogToUpdate.url,
    likes: blogToUpdate.likes + 100,
  };

  await api.put(`/api/blogs/${blogToUpdate.id}`).send(updatedBlog);

  const blogsAtEnd = await helper.blogsInDb();
  const likesAtEnd = blogsAtEnd.map((l) => l.likes);
  const totalLikesAtEnd = likesAtEnd.reduce((sum, l) => sum + l, 0);
  const updatedBlogAtend = blogsAtEnd.find((l) => l.id === blogToUpdate.id);

  console.log("LIKES OF BLOG-TO-UPDATE = ", blogToUpdate.likes);
  console.log("LIKES OF UPDATED-BLOG-AT-END  = ", updatedBlogAtend.likes);

  assert.strictEqual(updatedBlogAtend.likes, blogToUpdate.likes + 100);

  console.log("**************************************************");
  console.log("TOTAL LIKES AT FIRST  = ", totalLikes);
  console.log("TOTAL LIKES AT END   = ", totalLikesAtEnd);

  assert.strictEqual(totalLikesAtEnd, totalLikes + 100);
});

after(async () => {
  await mongoose.connection.close();
});
