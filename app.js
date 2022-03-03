// Requires for the projets
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override')
const Campground = require('./models/campground');

// Mongodb connection
mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected")
});

// Assigning express to the app variable
const app = express();

// telling express to use ejsMate to interpret ejs
// setting view engine to ejs, setting default path to always run from this folder
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// setting express to allow unpacking of forms via urlencoded
app.use(express.urlencoded({ extended: true }));
// setting the name for the methodoverride term used in query strings
app.use(methodOverride('_method'))

// ROUTING VIA EXPRESS

// home page
app.get('/', (req, res) => {
    res.render('home')
});

// all campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds })
});

// make new campground post request
app.post('/campgrounds', async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`)
})

// make newe campground page render
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new')
});

// show specific campground
app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/show', { campground })

})

// edit campground page render
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground })
})

// edit campground put request
app.put('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
})

// delete campground
app.delete('/campgrounds/:id', async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds')
})

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
});