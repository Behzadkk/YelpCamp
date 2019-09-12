require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.port || 3030;
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Comment = require("./models/comment");
const User = require("./models/user");
const seedDB = require("./seeds");

const commentRoutes = require("./routes/comments");
const campgroundRoutes = require("./routes/campgrounds");
const indexRoutes = require("./routes/index");
const reviewRoutes = require("./routes/review");

// mongoose.connect("mongodb://localhost:27017/yelp_camp", {
//   useNewUrlParser: true
// });
mongoose.connect(
  `mongodb+srv://behzad:${process.env.MOGODB_PASS}@yelpcamp-nvoyi.mongodb.net/test?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true
  }
);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");
// seed the database
// seedDB();

// PASSPORT CONFIGURATION
app.use(
  require("express-session")({
    secret: "No one can guess this one!!",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// local USER and NOTIFICATIONS
app.use(async function(req, res, next) {
  res.locals.notifications = {};
  res.locals.currentUser = req.user;
  if (req.user) {
    try {
      let user = await User.findById(req.user._id)
        .populate("notifications", null, { isRead: false })
        .exec();
      res.locals.notifications = user.notifications.reverse();
    } catch (err) {
      console.log(err.message);
    }
  }
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});
// Requiring Routes
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:slug/comments", commentRoutes);
app.use("/campgrounds/:slug/reviews", reviewRoutes);

app.listen(port, function() {
  console.log("The YelpCamp server has started");
});
