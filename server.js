// Required dependencies
require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");
var logger = require("morgan");

// Express server is being used
var app = express();

// Setting up port
var PORT = process.env.PORT || 3000;

// Using morgan to log requests
app.use(logger("dev"));

// Setting up Express for parsing data
app.use(express.urlencoded({
  extended: true
}));

app.use(express.json());

// Setting up static directory
app.use(express.static("public"));

// Setting up Handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
  defaultLayout: "main"
}));

app.set("view engine", "handlebars");

// HTML Route
require("./routes/htmlRoutes")(app);

// API Route
require("./routes/apiRoutes")(app);

// Port listener
app.listen(PORT, function () {
  console.log("You're now connected to PORT: " + PORT);
});