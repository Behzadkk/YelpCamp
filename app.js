const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.port || 3030;

let campgrounds = [
  {
    name: "Salmon Greek",
    image:
      "https://pixabay.com/get/ef3cb00b2af01c22d2524518b7444795ea76e5d004b0144497f9c071a7eab1_340.jpg"
  },
  {
    name: "Ouramanat",
    image:
      "https://pixabay.com/get/e83db40e28fd033ed1584d05fb1d4e97e07ee3d21cac104490f2c878afedb2bc_340.jpg"
  },
  {
    name: "Saint Hills",
    image: "https://farm7.staticflickr.com/6054/6335614644_f4cbf11d08.jpg"
  },
  {
    name: "Salmon Greek",
    image:
      "https://pixabay.com/get/ef3cb00b2af01c22d2524518b7444795ea76e5d004b0144497f9c071a7eab1_340.jpg"
  },
  {
    name: "Ouramanat",
    image:
      "https://pixabay.com/get/e83db40e28fd033ed1584d05fb1d4e97e07ee3d21cac104490f2c878afedb2bc_340.jpg"
  },
  {
    name: "Saint Hills",
    image: "https://farm7.staticflickr.com/6054/6335614644_f4cbf11d08.jpg"
  },
  {
    name: "Salmon Greek",
    image:
      "https://pixabay.com/get/ef3cb00b2af01c22d2524518b7444795ea76e5d004b0144497f9c071a7eab1_340.jpg"
  },
  {
    name: "Ouramanat",
    image:
      "https://pixabay.com/get/e83db40e28fd033ed1584d05fb1d4e97e07ee3d21cac104490f2c878afedb2bc_340.jpg"
  },
  {
    name: "Saint Hills",
    image: "https://farm7.staticflickr.com/6054/6335614644_f4cbf11d08.jpg"
  }
];

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
  res.render("landing");
});

app.get("/campgrounds", function(req, res) {
  res.render("campground", { campgrounds: campgrounds });
});

app.post("/campgrounds", function(req, res) {
  const name = req.body.name;
  const image = req.body.image;
  const newCampground = { name: name, image: image };
  campgrounds.push(newCampground);
  res.redirect("/campgrounds");
});

app.get("/campgrounds/new", function(req, res) {
  res.render("new");
});
app.listen(port, function() {
  console.log("The YelpCamp server has started");
});
