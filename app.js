if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

console.log(process.env.SECRET)

// Requires for the projets
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override')
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user')


const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users')

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

// setting express to allow unpacking of forms via urlencoded> NEED THIS FOR SUBMITTING FORMS!!!
// setting the name for the methodoverride term used in query strings
// setting static files path
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))



const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); // needed for persistent login sessions
passport.use(new localStrategy(User.authenticate())); // use local stratety and apply authenticate to User model

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// FLASING FOR ERROR AND SUCCESS. THIS MIDDLEWARE ALLOWS IT TO BE ACCESSED FROM ANY ROUTE. STORES ON 'LOCALS"
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
})

app.get('/fakeUser', async (req, res) => {
    const user = new User({ email: 'colt@gmail.com', username: 'coltttt' }); // hard coding fake user
    const newUser = await User.register(user, 'monkey'); // takes model instance and password. hashes and stores password
    res.send(newUser)
})


// ROUTING
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes)


// home page
app.get('/', (req, res) => {
    res.render('home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, SOmething Went Wrong';
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log("LISTENING ON PORT 3000")
});