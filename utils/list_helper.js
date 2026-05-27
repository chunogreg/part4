const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const total = blogs.reduce((sum, blog) => {
    return sum + blog.likes;
  }, 0);
  return total;
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;
  const result = blogs.reduce((favorite, blog) =>
    favorite.likes > blog.likes ? favorite : blog,
  );
  return result;
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return {};
  const authorBlogCount = {};
  let maxBlog = 0;
  let maxBlogAuthor;
  for (var n = 0; n < blogs.length; n++) {
    if (blogs[n].author in authorBlogCount) {
      authorBlogCount[blogs[n].author] += 1;
    } else {
      // authorBlogCount["author"][n] = blogs[n].author;

      authorBlogCount[blogs[n].author] = 1;
    }
    if (authorBlogCount[blogs[n].author] > maxBlog) {
      maxBlog = authorBlogCount[blogs[n].author];
      maxBlogAuthor = blogs[n].author;
    }
  }
  console.log("Function executed successfully! Data received:", {
    author: maxBlogAuthor,
    blogs: maxBlog,
  });
  return { author: maxBlogAuthor, blogs: maxBlog };

  //return result;
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) return {};
  let topAuthor = "";
  let maxLikes = 0;
  //= Math.max(...blogs.map((blog) => blog.likes));
  const authorWithMaxLikes = {};
  for (var n = 0; n < blogs.length; n++) {
    if (blogs[n].author in authorWithMaxLikes) {
      authorWithMaxLikes[blogs[n].author] += blogs[n].likes;
    } else {
      authorWithMaxLikes[blogs[n].author] = blogs[n].likes;
    }
    if (authorWithMaxLikes[blogs[n].author] > maxLikes) {
      maxLikes = authorWithMaxLikes[blogs[n].author];
      topAuthor = blogs[n].author;
    }
  }

  console.log("THE AUTHOR OF THE BLOG WITH THE MOST LIKES IS::", {
    author: topAuthor,
    likes: maxLikes,
  });
  return { author: topAuthor, likes: maxLikes };
};

const longArgument = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
  },
];

if (require.main === module) {
  mostLikes(longArgument);
}

module.exports = { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes };
