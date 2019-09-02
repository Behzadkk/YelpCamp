const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");

// INDEX - Show All Campgrounds
router.get("/", function(req, res) {
  Campground.find({}, function(err, allCampgrounds) {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", {
        campgrounds: allCampgrounds
      });
    }
  });
});

// CREATE - Add New Campground to DB
router.post("/", isLoggedIn, function(req, res) {
  const name = req.body.name;
  const image = req.body.image;
  const description = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username
  };
  const newCampground = {
    name: name,
    image: image,
    description: description,
    author: author
  };
  Campground.create(newCampground, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/campgrounds");
    }
  });
});

// NEW - Shows form to create new campground
router.get("/new", isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCampground) {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});
// EDIT campground route
router.get("/:id/edit", checkCampgroundOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    res.render("campgrounds/edit", { campground: foundCampground });
  });
});
// UPDATE campground route
router.put("/:id", checkCampgroundOwnership, function(req, res) {
  // find and updaye the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(
    err,
    updatedCampground
  ) {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      // redirect to show page
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// DESTROY campground route
router.delete("/:id", checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
    if (err) {
      console.log(err);
    }
    Comment.deleteMany({ _id: { $in: campgroundRemoved.comments } }, err => {
      if (err) {
        console.log(err);
      }
      res.redirect("/campgrounds");
    });
  });
});

// middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, function(err, foundCampground) {
      if (err) {
        res.redirect("back");
      } else {
        // does user own the campground?
        if (foundCampground.author.id.equals(req.user.id)) {
          next();
        } else {
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("back");
  }
}
module.exports = router;
