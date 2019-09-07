const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const User = require("../models/user");
const Notification = require("../models/notification");
const middleware = require("../middleware");
const NodeGeocoder = require("node-geocoder");
var cloudinary = require("cloudinary").v2;
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter });

cloudinary.config({
  cloud_name: "dadhpknsf",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

const geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get("/", function(req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    // Get all campgrounds from DB
    Campground.find({ name: regex }, function(err, allCampgrounds) {
      if (err) {
        console.log(err);
      } else {
        if (allCampgrounds.length < 1) {
          req.flash(
            "error",
            "No campground matches that query, please try again"
          );
          res.redirect("/campgrounds");
        } else {
          res.render("campgrounds/index", {
            campgrounds: allCampgrounds,
            page: "campgrounds"
          });
        }
      }
    });
  } else {
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/index", {
          campgrounds: allCampgrounds,
          page: "campgrounds"
        });
      }
    });
  }
});
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single("image"), function(
  req,
  res
) {
  // get data from form and add to campgrounds array
  const name = req.body.name;
  const price = req.body.price;
  const desc = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username
  };

  geocoder.geocode(req.body.location, function(err, data) {
    if (err || !data.length) {
      console.log(data);
      console.log(err);
      req.flash("error", "Invalid address");
      return res.redirect("back");
    }
    // secure url for uploaded image
    cloudinary.uploader.upload(req.file.path, async function(err, result) {
      const lat = data[0].latitude;
      const lng = data[0].longitude;
      const location = data[0].formattedAddress;
      const newCampground = {
        name: name,
        price: price,
        description: desc,
        author: author,
        location: location,
        lat: lat,
        lng: lng
      };
      newCampground.image = result.secure_url;
      newCampground.imageId = result.public_id;
      try {
        let campground = await Campground.create(newCampground);
        let user = await User.findById(req.user._id)
          .populate("followers")
          .exec();
        let newNotification = {
          username: req.user.username,
          campgroundId: campground.id
        };
        for (const follower of user.followers) {
          let notification = await Notification.create(newNotification);
          follower.notifications.push(notification);
          follower.save();
        }

        //redirect back to campgrounds page
        res.redirect(`/campgrounds/${campground.id}`);
      } catch (err) {
        req.flash("error", err.message);
        res.redirect("back");
      }
    });
  });
});

// NEW - Shows form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res) {
  Campground.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCampground) {
      if (err || !foundCampground) {
        req.flash("error", "Campground not found");
        res.redirect("back");
        console.log(err);
      } else {
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
});
// EDIT campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(
  req,
  res
) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    res.render("campgrounds/edit", { campground: foundCampground });
  });
});

// UPDATE CAMPGROUND ROUTE
router.put(
  "/:id",
  middleware.checkCampgroundOwnership,
  upload.single("image"),
  function(req, res) {
    Campground.findById(req.params.id, async function(err, campground) {
      if (err) {
        req.flash("error", err.message);
        res.redirect("back");
      } else {
        if (req.file) {
          try {
            await cloudinary.uploader.destroy(campground.imageId);
            const result = await cloudinary.uploader.upload(req.file.path);
            campground.imageId = result.public_id;
            campground.image = result.secure_url;
          } catch (err) {
            req.flash("error", err.message);
            return res.redirect("back");
          }
        }
        const data = await geocoder.geocode(req.body.location);
        if (!data.length) {
          req.flash("error", "Invalid address");
          return res.redirect("back");
        }
        campground.lat = data[0].latitude;
        campground.lng = data[0].longitude;
        campground.location = data[0].formattedAddress;
        campground.name = req.body.name;
        campground.price = req.body.price;
        campground.description = req.body.description;
        campground.save();
        req.flash("success", "Successfully Updated!");
        res.redirect("/campgrounds/" + campground._id);
      }
    });
  }
);

// DESTROY campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findById(req.params.id, async function(err, campground) {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }
    try {
      await cloudinary.uploader.destroy(campground.imageId);
      Comment.deleteMany({ _id: { $in: campground.comments } });
      campground.remove();
      req.flash("success", "Campground deleted successfully!");
      res.redirect("/campgrounds");
    } catch (err) {
      if (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    }
  });
});

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
module.exports = router;
