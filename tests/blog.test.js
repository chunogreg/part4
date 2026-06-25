require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);

const { test, after, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const api = supertest(app);
const helper = require("./test_helper");
const Blog = require("../models/blog");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { error } = require("node:console");
//const jwt = require("jsonwebtoken");

describe("when there is only one user in DB", () => {
  const getAuthToken = async () => {
    const dbUser = await User.findOne({ username: "test" });
    return helper.generateTestToken({
      username: dbUser.username,
      id: dbUser._id.toString(),
    });
  };

  beforeEach(async () => {
    await User.deleteMany({});
    const salt = 10;
    const passwordHash = await bcrypt.hash("123456", salt);
    const user = new User({ username: "test", passwordHash: passwordHash });
    const savedUser = await user.save();
  });

  test("invalid user are not created", async () => {
    const token = await getAuthToken();
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      name: "Normaluser",
      //username: "user2222",
      password: "123456",
    };

    const res = await api
      .post("/api/users/")
      .send(newUser)
      .set("Authorization", `Bearer ${token}`)
      .expect(400)
      .expect({ error: "Both username and password are needed" });

    const usersAtEnd = await helper.usersInDb();

    //console.log("USERS AT END ======= ", usersAtEnd);

    const namesOfUsers = usersAtEnd.map((n) => n.name);

    assert(!namesOfUsers.includes("Normaluser"));

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });

  describe("when there is initially some blogs saved", () => {
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

      //console.log("THE BLOG TO TEST  ====   ", blogToTest);
      assert(titles.includes(blogToTest.title));
    });

    test("verifies that id property of the blog posts is named id", async () => {
      const res = await api.get("/api/blogs");

      const blog = res.body.filter((b) => b.hasOwnProperty("id"));

      //console.log(
      //   "BLOGS HAS ID ======",
      //   res.body.map((b) => b),
      // );

      assert.strictEqual(blog.length, res.body.length, "blog is missing in id");
    });

    test("verify that POST request creates a new blog", async () => {
      const token = await getAuthToken();

      const newBlog = {
        title: "React patterns xxxxxxxxxx",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201);
      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(helper.initiaBlogs.length + 1, blogsAtEnd.length);
    });

    test("Likes property defaults to 0 if ommitted", async () => {
      const token = await getAuthToken();
      const newBlog = {
        title: "React patterns xxxxxxxxxx",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
      };

      //token = await helper.generateTestToken();

      const res = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog);

      const returnedBlogs = await helper.blogsInDb();
      //console.log("RETURED BLOGS ARE ===== ", returnedBlogs);
      const blogWithoutLikes = returnedBlogs.find(
        (b) => b.title === "React patterns xxxxxxxxxx",
      );

      assert.strictEqual(blogWithoutLikes.likes, 0);
    });

    test("Blog without title property is not added", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const token = await getAuthToken();

      const newBlog = {
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 8,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .set("Authorization", `Bearer ${token}`)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
    });

    test("a single Blog can be deleted", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const token = await getAuthToken();

      const newBlog = {
        title: "Blog to delete",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 333,
      };

      //token = await helper.generateTestToken();

      const res = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201);

      const blogsAfterPost = await helper.blogsInDb();

      assert.strictEqual(blogsAfterPost.length, blogsAtStart.length + 1);

      await api
        .delete(`/api/blogs/${res.body.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      const remainingBlogs = await helper.blogsInDb();

      const blogIds = remainingBlogs.map((b) => b.id);
      //assert(blogIds.includes(blogToDelete.id, false));
      assert(!blogIds.includes(res.body.id));

      assert.strictEqual(remainingBlogs.length, blogsAfterPost.length - 1);
    });

    test("update a single Blog's information", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[1];

      const allLikes = blogsAtStart.map((l) => l.likes);
      const totalLikes = allLikes.reduce((sum, l) => sum + l, 0);

      ////console.log("BEFORE UPDATE = ", blogToUpdate.likes);

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

      //console.log("LIKES OF BLOG-TO-UPDATE = ", blogToUpdate.likes);
      //console.log("LIKES OF UPDATED-BLOG-AT-END  = ", updatedBlogAtend.likes);

      assert.strictEqual(updatedBlogAtend.likes, blogToUpdate.likes + 100);

      //console.log("**************************************************");
      //console.log("TOTAL LIKES AT FIRST  = ", totalLikes);
      //console.log("TOTAL LIKES AT END   = ", totalLikesAtEnd);

      assert.strictEqual(totalLikesAtEnd, totalLikes + 100);
    });

    test("adding a blog without a token fails with 401 Unauthorized", async () => {
      const blogsAtStart = await helper.blogsInDb();

      const newBlog = {
        title: "Test Blog",
        author: "Test Author",
        url: "https://test.com",
        likes: 50,
      };

      await api
        .post("/api/blogs")
        .send(newBlog)
        .expect(401)
        .expect({ error: "Unauthorized" });

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
    });
  });

  after(async () => {
    await mongoose.connection.close();
  });
});
