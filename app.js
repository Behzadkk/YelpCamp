const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.port || 3030;
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/yelp_camp", {
  useNewUrlParser: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// SCHEMA SETUP
const campgroundShema = new mongoose.Schema({
  name: String,
  image: String
});

const Campground = mongoose.model("Campground", campgroundShema);

// Campground.create(
//   {
//     name: "Ouramanat",
//     image:
//       "https://cdn.pixabay.com/photo/2016/06/06/08/32/tent-1439061_960_720.jpg"
//   },
//   function(err, campground) {
//     if (err) {
//       console.log("OH, ERROR!!!");
//       console.log(err);
//     } else {
//       console.log("NEWLY CREATED CAMPGROUND");
//       console.log(campground);
//     }
//   }
// );

app.get("/", function(req, res) {
  res.render("landing");
});

app.get("/campgrounds", function(req, res) {
  Campground.find({}, function(err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render("campground", { campgrounds: allCampgrounds });
    }
  });
});

app.post("/campgrounds", function(req, res) {
  const name = req.body.name;
  const image = req.body.image;
  const newCampground = { name: name, image: image };
  Campground.create(newCampground, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/campgrounds");
    }
  });
});

app.get("/campgrounds/new", function(req, res) {
  res.render("new");
});
app.listen(port, function() {
  console.log("The YelpCamp server has started");
});
