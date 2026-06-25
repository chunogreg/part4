const User = require("../models/user");
const usersRouter = require("express").Router();
const bcrypt = require("bcrypt");
const { error } = require("../utils/logger");

usersRouter.post("/", async (req, res) => {
  const { name, username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Both username and password are needed" });
  }
  if (password.length < 3 || username.length < 3) {
    return res
      .status(400)
      .json({ error: "Password and username must more than 2 charaters" });
  }

  const salt = 10;

  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = new User({ name, username, passwordHash });

  const savedUser = await newUser.save();

  res.status(201).json(savedUser);
});

usersRouter.get("/", async (req, res) => {
  const users = await User.find({}).populate("blogs", { title: 1, author: 1 });
  res.status(200).json(users);
});

module.exports = usersRouter;
