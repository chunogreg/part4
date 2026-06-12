const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: String,
    url: String,
    likes: { type: Number, default: 0 },
  },
  { autoIndex: false },
);

blogSchema.set("toJSON", {
  transform: (document, returnedObj) => {
    returnedObj.id = returnedObj._id.toString();
    delete returnedObj.__v;
    delete returnedObj._id;
  },
});

module.exports = mongoose.model("Blog", blogSchema);
