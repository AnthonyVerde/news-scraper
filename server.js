// Required dependencies

var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var logger = require("morgan");


// Requiring models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Setting up Express
var app = express();
app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static public folder
app.use(express.static("public"));

// Setting up 
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");
// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news-scraper";

mongoose.connect(MONGODB_URI);

// Routes
app.get("/", function (req, res) {
  res.render("home");
});

// Setting up GET route for scraping Jalopnik.com
app.get("/scrape", function (req, res) {

  // Grabbing the HTML body
  axios.get("https://jalopnik.com/c/news").then(function (response) {

    // Using Cheerio to save it to shorthand selector
    var $ = cheerio.load(response.data);

    // Grabbing all h1 elements
    $("h1").each(function (i, element) {
      var result = {};

      result.title = $(this)
        .text();
      result.link = $(this)
        .children()
        .attr("href");
      result.summary = $(this)
        .text();

      db.Article.create(result)
        .then(function (dbArticle) {
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    res.render("index");
  });
});

app.get("/articles", function (req, res) {
  db.Article.find({})
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/articles/:id", function (req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/articles/:id", function (req, res) {
  db.Note.create(req.body)
    .then(function (dbNote) {

      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function () {
  console.log("You are now connected to PORT " + PORT);
});
