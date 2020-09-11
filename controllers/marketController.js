const validator = require('express-validator');
const Market = require('../models/market');
const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Set Storage With Multer
const storage = multer.diskStorage({
	destination: './public/images/',
	filename: function(req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

// Init upload multer
const upload = multer({
	storage: storage
});

// Display all market products
exports.market_list = (req, res, next) => {
	Market.find()
		.exec((err, list_market) => {
			if(err) { return next(err); }
			// Successful, render
			res.render('market_list', { title: 'Market Items', market_list: list_market });
		});
};

// Display detail page of dairy product
exports.market_item = (req, res, next) => {
	Market.findById(req.params.id)
		.exec(function(err, market) {
			if (err) { return next(err); }
			if (market===null) { // Not Found
				const err = new Error('Market Item not found');
				err.status = 404;
				return next(err);
			}
			// Successful; render.
			res.render('market_detail', { title: 'Market Item Details', market: market });
		});
};

// Display create form on GET
exports.market_create_get = (req, res, next) => {
	res.render('market_create_form', { title: 'Create Market Product' });
};

// Handle create form on POST
exports.market_create_post = [
	upload.single('img'),
	// Validate that appropriate fields are not empty
	validator.body('name', 'You must include the Product name!').trim().isLength({ min: 1 }),
	validator.body('usda', 'Choices are either Prime, Select, or None.').trim(),
	// Sanitize all fields
	validator.sanitizeBody('name').escape(),
	validator.sanitizeBody('usda').escape(),
	// Process after validating and sanitizing
	(req, res, next) => {
		// Extract errors from request
		const errors = validator.validationResult(req);
		// create new market object with data
		const market = new Market({
			name: req.body.name,
			price: req.body.price,
			usda: req.body.usda,
			quantity: req.body.quantity,
			img:  { data: fs.readFileSync(req.file.path), contentType: req.file.mimetype }
		});

		if(!errors.isEmpty()) {
			// there are errors: render create form again with messages/ values
			res.render('market_create_form', { title: 'Create Market Product', market: market, errors: errors.array() });
			return;
		} else {
			// Data from the form is valid
			// make sure the market product doesn't already exist
			Market.findOne({ 'name': req.body.name })
				.exec(function(err, found_market) {
					if (err) { return next(err); }
					if (found_market) {
						// redirect to the found product detail page
						res.redirect(found_market.url);
					}
					else {
						market.save(function(err) {
							if (err) { return next(err); }
							// product is saved, redirect to its detail page
							res.redirect(market.url);
						});
					}
				});
		}
	}
];

// Display delete form on GET
exports.market_delete_get = (req, res, next) => {
	Market.findById(req.params.id)
		.exec(function(err, market) {
			if (err) { return next(err); }
			if(market===null) { // No Results
				res.redirect('/inventory/grocery');
			}
			// Successful, so render
			res.render('market_delete', { title: 'Delete Market Product', market: market });
		});
};

// Handle Delete on POST
exports.market_delete_post = (req, res) => {
	Market.findByIdAndRemove(req.body.id, function deleteMarketProduct(err) {
		if (err) { return next(err); }
		// Success - return to market item list page
		res.redirect('/inventory/market');
	});
};

// Display update form on GET
exports.market_update_get = (req, res, next) => {
	Market.findById(req.params.id, function(err, market) {
		if (err) { return next(err); }
		if (market===null) { // No result
			const err = new Error('Market Product Not Found');
			err.status = 404;
			return next(err);
		}
		// Success
		res.render('market_create_form', { title: 'Update Market Product', market: market });
	});
};

// Handle update on POST
exports.market_update_post = [
	upload.single('img'),
	// Validate that appropriate fields are not empty
	validator.body('name', 'You must include the Product name!').trim().isLength({ min: 1 }),
	validator.body('usda', 'Choices are either Prime, Select, or None.').trim(),
	// Sanitize all fields
	validator.sanitizeBody('name').escape(),
	validator.sanitizeBody('usda').escape(),
	// Process after validating and sanitizing
	(req, res, next) => {
		// Extract any possible errors
		const errors = validator.validationResult(req);

		// create market product with data (include old id!)
		const market = new Market({
			name: req.body.name,
			price: req.body.price,
			usda: req.body.usda,
			quantity: req.body.quantity,
			img:  { data: fs.readFileSync(req.file.path), contentType: req.file.mimetype },
			_id: req.params.id
		});

		if(!errors.isEmpty()) {
			// There are errors; render form again with values/ error messages
			res.render('market_create_form', { title: 'Update Market Product', market: market, errors: errors.array() });
			return;
		} else {
			// Data from the form is valid; update the product
			Market.findByIdAndUpdate(req.params.id, market, {}, function(err, themarket) {
				if (err) { return next(err); }
				// Successful - redirect to the market product detail page
				res.redirect(themarket.url);
			});
		}
	}
];