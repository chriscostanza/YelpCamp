if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const cities = require('./cities')
const { descriptors, places } = require('./seedHelpers')
const Campground = require('../models/campground');
const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected")
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const rand1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 50) + 10;
        const camp = new Campground({
            author: '624db00ee32d8fa9b52a9e68',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dskpumk3o/image/upload/v1648929333/YelpCamp/ojpswgkjqokb7t70jnq2.jpg',
                    filename: 'YelpCamp/trvoghopjnbvwqmkh83g'
                },
                {
                    url: 'https://res.cloudinary.com/dskpumk3o/image/upload/v1648508863/YelpCamp/fvd20m5mlouivpyxksre.jpg',
                    filename: 'YelpCamp/fvd20m5mlouivpyxksre'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. In corporis illum tempore, doloribus numquam similique molestias minus, voluptatibus commodi repellendus eligendi laudantium quia? Ea illo, repellendus beatae laudantium culpa inventore.',
            price: price,
            geometry: { type: 'Point', coordinates: [ 
                cities[rand1000].longitude,
                cities[rand1000].latitude] },
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})
