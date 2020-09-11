#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Dairy = require('./models/dairy');
var Grocery = require('./models/grocery');
var Market = require('./models/market');
var Produce = require('./models/produce');


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const dairyProducts = [];
const groceryProducts = [];
const marketProducts = [];
const produceProducts = [];

function dairyCreate(brandname, product, price, img, cb) {
  
  const dairy = new Dairy({
    brandname,
    product,
    price,
    img,
  });
       
  dairy.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Dairy Product: ' + dairy);
    dairyProducts.push(dairy);
    cb(null, dairy);
  }  );
}

function groceryCreate(brandname, product, price, quantity, img, cb) {
  const grocery = new Grocery({ 
    brandname: brandname,
    product: product,
    price: price,
    quantity: quantity,
    img: img 
  });
       
  grocery.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Grocery Product: ' + grocery);
    groceryProducts.push(grocery);
    cb(null, grocery);
  }   );
}

function marketCreate(name, price, usda, quantity, img, cb) {
  const market = new Market({
    name: name,
    price: price,
    usda: usda,
    quantity: quantity,
    img: img
  });
        
  market.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Market Item: ' + market);
    marketProducts.push(market);
    cb(null, market);
  }  );
}


function produceCreate(name, price, type, img, cb) {
  const produce = new Produce({
    name: name,
    price: price,
    type: type,
    img: img
  });    
  produce.save(function (err) {
    if (err) {
      console.log('ERROR CREATING produce: ' + produce);
      cb(err, null)
      return
    }
    console.log('New Produce Item: ' + produce);
    produceProducts.push(produce);
    cb(null, produce);
  }  );
}


function createDairyProducts(cb) {
    async.parallel([
        function(callback) {
          dairyCreate('Cheep Brand', 'Milk', 2.89, '/images/milk.jpg', callback);
        },
        function(callback) {
          dairyCreate('Cheep Brand', 'Yogurt', 1.59, '/images/yogurt.jpg', callback);
        },
        function(callback) {
          dairyCreate('Cheep Brand', 'Eggs', 1.89, '/images/eggs.jpg', callback);
        },
        function(callback) {
          dairyCreate('Cheep Brand', 'Butter', 2.59, '/images/butter.jpg', callback);
        }
        ],
        // optional callback
        cb);
}


function createGroceryProducts(cb) {
    async.parallel([
        function(callback) {
          groceryCreate('Cheep Brand', 'Bread', 3.99, 10, '/images/bread.jpg', callback);
        },
        function(callback) {
          groceryCreate('Cheep Brand', 'Soup', 1.89, 18, '/images/soup.jpg', callback);
        },
        function(callback) {
          groceryCreate('Cheep Brand', 'Juice', 2.99, 9, '/images/juice.jpg', callback);
        },
        function(callback) {
          groceryCreate('Cheep Brand', 'Rice', 1.99, 5, '/images/rice.jpg', callback);
        },
        function(callback) {
          groceryCreate('Cheep Brand', 'Cereal', 5.99, 15, '/images/cereal.jpg', callback);
        },
        function(callback) {
          groceryCreate('Cheep Brand', 'Flour', 6.79, 18, '/images/flour.jpg', callback);
        }
        ],
        // optional callback
        cb);
}


function createMarketProducts(cb) {
    async.parallel([
        function(callback) {
          marketCreate('Bacon', 3.99, 'None', 1, '/images/bacon.jpg', callback);
        },
        function(callback) {
          marketCreate('Ribeye Steak', 8.99, 'Prime', 7, '/images/steak.jpg', callback);
        },
        function(callback) {
          marketCreate('Chicken', 7.99, 'None', 15, '/images/chicken.jpg', callback);
        },
        ],
        // Optional callback
        cb);
}

function createProduceProducts(cb) {
    async.parallel([
        function(callback) {
          produceCreate('Bananas', 1.99, 'Fruit', '/images/banana.jpg', callback);
        },
         function(callback) {
          produceCreate('Apples', 1.59, 'Fruit', '/images/apple.jpg', callback);
        },
         function(callback) {
          produceCreate('Spinach', 1.99, 'Vegetable', '/images/spinach.jpg', callback);
        },
         function(callback) {
          produceCreate('Asparagus', 1.89, 'Vegetable', '/images/asparagus.jpg', callback);
        },
      ],
      // Optional callback
      cb);
}



async.series([
    createDairyProducts,
    createGroceryProducts,
    createMarketProducts,
    createProduceProducts
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+ err);
    }
    else {
        console.log(results);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});
