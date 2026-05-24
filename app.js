const express = require("express");
const app = express();
const mongoose = require("mongoose");
const config = require("./utils/config");
const logger = require("./utils/logger");
const blogsRouter = require("./controllers/blogs");

const mongoUrl = config.MONGODB_URI;
mongoose
  .connect(mongoUrl, { family: 4 })
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((err) => {
    logger.error("Failed to connect to MongoDB", err);
  });

app.use(express.static("dist"));
app.use(express.json());
app.use("/api/blogs", blogsRouter);

module.exports = app;
