# YelpCamp

A demo version of this app is avalable at [heroku](https://gentle-mesa-20349.herokuapp.com)

## Features

#### Authentication
All users can view all campground in this app. But for other interactions such as posting a new campground, giving feedback or living comments, they need to be logged in.

Authentication (register and loging in) is created by using Passport package.

#### User profile
like campgrounds
rate(1-5 star) campgrounds
follow users
recieve notification


#### Database
 MongoDB
 
 #### Map
 Google API is used to define and show the locations of the campgrounds.

#### UI
Bootstrap 4


## User's Journey
1. Landing page // a slide show and a button to campground's index page
2. Campgrounds index // a list of all camps with some reviews details
3. A campground page // campground's details and a location map with ability to like and add reviews (User need to be logged in)

4.1. Sign up page
4.2. Sign in page
4.3. Forget password

5. Like/unlike a campground
6. Add/edit/delete a review (1 to 5 star) -ristricted to one review per user
7. Add/edit/delete a comment (on the same page)

8.Add/edit/delete a campground// name, price, description, location(using google api)

9.follow a user
10. receive/view notifications

