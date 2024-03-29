require("dotenv").config();
const express = require("express");
// const bodyParser = require("body-parser");
const ejs = require("ejs");
const md = require("markdown-it")();
const formatDistanceToNow = require("date-fns/formatDistanceToNow");

const homeStartingContent =
  "Hi, so I am Bala Subramaniam. I am from Chennai, India. Well I am an enthusiastic web developer and trying out other technologies and domains in the computer software field as well. I started solving algorithmic problems for cracking interviews and started loving it. And some of my hobbies are playing chess and reading books. Well if you found this blog, you are awesome.I plan to keep on updating this blog with my knowledge and experience.I hope you enjoy my blog.";
const aboutContent =
  "This site was built using ExpressJS and NodeJS and MongoDB is used to store the data in the backend. This site was initially built for learning NodeJS and Express JS in detailed. This includes handling routes inside app.js and creating a custom url for posts. This site is still in progress and I am working on adding more features and functionality. Pagination and search is the latest added feature. I am also working on adding a login system and a user profile page. Other features like edit and delete are yet to be added.";
const contactContent =
  "So if you want to contact me, you can email me at balavtwo@gmail.com. I am also on LinkedIn and GitHub and I have left the links for them below. Most of my other coding profiles could be found under the handle bala418. There's an interesting story about the number 418. Many wondered if it was my birthday but it wasn't. It just shows that I am a tea guy. It's actually an HTTP status code indicating that the server refuses to brew coffee because it's, permanently a tea pot. I also needed a unique username that has my name and something short to remember. And hence my username. If you have read this, you are just the best. Have a good day and I hope we can connect soon. Ciao!";

const app = express();
const mongoose = require("mongoose");
const favicon = require("serve-favicon");
app.set("view engine", "ejs");
// app.use(bodyParser.urlencoded({extended: true}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(favicon(__dirname + "/public/favicon.ico"));
mongoose.connect(process.env.MONGO_URI);

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const Blog = mongoose.model("Blog", blogSchema);

app.get("/", function (req, res) {
  Blog.find({}, (err, items) => {
    if (err) {
      // console.log(err);
    } else {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const results = {};
      if (endIndex < items.length) {
        results.next = {
          page: page + 1,
          limit: limit,
        };
      }

      if (startIndex > 0) {
        results.prev = {
          page: page - 1,
          limit: limit,
        };
      }

      results.results = items.slice(startIndex, endIndex);

      results.limit = limit;

      // res.json(results);

      res.render("home", {
        postss: results.results,
        hs: homeStartingContent,
        formatDistanceToNow: formatDistanceToNow,
        prev: results.prev,
        next: results.next,
        limit: results.limit,
      });
    }
  }).sort({ createdAt: -1 });
});

app.get("/about", function (req, res) {
  res.render("about", { as: aboutContent });
});

app.get("/contact", function (req, res) {
  res.render("contact", { cs: contactContent });
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.get("/posts/:postName", function (req, res) {
  var reqID = req.params.postName;
  Blog.findOne({ _id: reqID }, (err, item) => {
    if (err) {
      // console.log(err);
    } else {
      var x = item.content;
      var y = md.render(x);
      // console.log(y);
      res.render("post", { post: item, content: y });
    }
  });
});

// get all other routes
app.get("*", function (req, res) {
  res.redirect("/");
});

app.post("/", function (req, res) {
  // console.log(req.body);
  const post = new Blog({
    title: req.body.postTitle,
    content: req.body.postContent,
    createdAt: new Date(),
  });

  post.save((err) => {
    if (!err) {
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  });
});

app.post("/search", function (req, res) {
  const search = req.body.search;
  // regex for search in title and content
  const regex = new RegExp(search, "gi");
  Blog.find({ $or: [{ title: regex }, { content: regex }] }, (err, items) => {
    if (err) {
      // console.log(err);
    } else {
      res.render("search", {
        postss: items,
        formatDistanceToNow: formatDistanceToNow,
      });
    }
  }).sort({ createdAt: -1 });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server is running on port 3000");
});
