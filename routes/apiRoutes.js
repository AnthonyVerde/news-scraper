// Dependencies
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");

// Requiring all models
var db = require("../models");

// Connecting to MONGODB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/news-scraper";
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
});

module.exports = function (app) {

    // Retrieving data from db
    app.get("/all", function (req, res) {
        // Collecting everything in Article db
        db.Article.find({})
            .then(function (dbArticle) {
                // Sending articles to the client
                res.json(dbArticle);
            })
            .catch(function (err) {
                // Respond with error if needed
                res.json(err);
            });
    });

    // Creating GET route for scraping echoJS
    app.get("/scrape", function (req, res) {

        // Using axios to grab <body>
        axios.get("http://www.echojs.com/").then(function (response) {

            // Loading <body> into cheerio and creating shorthand selector
            var $ = cheerio.load(response.data);

            // Grabbing all article h1s
            $("article h1").each(function (i, element) {

                // Creating an empty object fo fill with the result
                var result = {};

                // Result data to be inserted into object
                result.title = $(this)
                    .children("a")
                    .text();
                result.link = $(this)
                    .children("a")
                    .attr("href");

                // Creating article from data in filled result object
                db.Article.create(result)
                    .then(function (dbArticle) {

                        // View the added result in the console
                        console.log(dbArticle);
                    })
                    // Logging any errors
                    .catch(function (err) {
                        console.log(err);
                    });
            });

            // Scrape confirmation
            res.send("You've successfully scraped");
        });
    });

    // A GET route for scraping the echoJS website
    app.get("/jalopnik", function (req, res) {

        // First, we grab the body of the html with axios
        axios.get("https://www.jalopnik.com").then(function (response) {

            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data, {
                normalizeWhitespace: true,
                xmlMode: true
            });

            var total = 0;

            // Loop through all the 'item' elements
            $('item').each(function (i, element) {

                // Save an empty result object
                var result = {};

                // Add the info of every story, and save them as properties of the result object
                result.title = $(this).children('title').text() || "title";
                result.link = $(this).children('link').text() || "link";
                result.author = $(this).children('author').text() || "author";
                result.category = $(this).children('category').text() || "category";
                result.description = $(this).children('description').text() || "description";
                result.image = $(this).children('description').text().match(/src='(.*?)'/)[1] || "image";

                // Create a new News document using the `result` object built from scraping
                db.News.create(result)
                    .then(function (dbNews) {
                        
                        // View the added result in the console
                        console.log(dbNews);
                    })
                    .catch(function (err) {
                        
                        // If an error occurred, log it
                        console.log(err);
                    });

                total = i + 1;
            });

            // Send a message to the client
            res.send("Successful scrape of Jalpinik.com! Here are " + total + " new articles for you to read.");
        });
    });




};