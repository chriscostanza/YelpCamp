const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware.js')

const campgrounds = require('../controllers/campgrounds')

router.route('/')
    .get(catchAsync(campgrounds.index)) // all campgrounds index
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)); // make new campground post request

// make new campground page render
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground)) // show specific campground
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))// edit campground put request
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); // delete campground

// edit campground page render
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;