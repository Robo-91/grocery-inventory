const validator = require('express-validator');
const Grocery = require('../models/grocery');
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

// Display all grocery products
exports.grocery_list = (req, res, next) => {
	Grocery.find()
		.exec((err, list_grocery) => {
			if (err) { return next(err); }
			// Successful, So Render.
			res.render('grocery_list', { title: 'Grocery Items', grocery_list: list_grocery });
		});	
};

// Display detail page of dairy product
exports.grocery_item = (req, res, next) => {
	Grocery.findById(req.params.id)
		.exec(function(err, grocery) {
			if (err) { return next(err); }
			if (grocery===null) { // No Results
				const err = new Error('Grocery Product not found');
				err.status = 404;
				return next(err);
			}
			// Successful; render.
			res.render('grocery_detail', {title: 'Grocery Item Detail', grocery: grocery });
		});
};

// Display create form on GET
exports.grocery_create_get = (req, res) => {
	res.render('grocery_create_form', { title: 'Create Grocery Product' });
};

// Handle create form on POST
exports.grocery_create_post = [
	upload.single('grocery-img'),
	// Validate that all fields are not empty
	validator.body('brandname', 'Please include the Brandname!').trim().isLength({ min: 1 }),
	validator.body('product', 'Type of Produce required!').trim().isLength({ min: 1 }),
	// Sanitize all fields
	validator.sanitizeBody('brandname').escape(),
	validator.sanitizeBody('product').escape(),
	// Process after validation and sanitization
	(req, res, next) => {
		// Store errors from request
		const errors = validator.validationResult(req);
		// Create a new grocery object with data
		const grocery = new Grocery({
			brandname: req.body.brandname,
			product: req.body.product,
			price: req.body.price,
			quantity: req.body.quantity,
			img: { data: fs.readFileSync(req.file.path), contentType: req.file.mimetype }
		});

		if(!errors.isEmpty()) {
			// There are errors. Render form again with values/ error messages
			res.render('grocery_create_form', { title: 'Create Grocery Product', grocery: grocery, errors: errors.array() });
			return;
		} else {
			// Data from the form is valid
			// Make sure this product doesn't already exist
			Grocery.findOne({ 'product': req.body.product })
				.exec(function(err, found_grocery) {
					if (err) { return next(err); }
					if (found_grocery) {
						// the product exists, redirect to its detail page
						res.redirect(found_grocery.url);
					}
					else {
						grocery.save(function(err) {
							if (err) { return next(err); }
							// product saved, redirect to its detail page
							res.redirect(grocery.url);
						});
					}
				});
		}
	}
];

// Display delete form on GET
exports.grocery_delete_get = (req, res, next) => {
	Grocery.findById(req.params.id)
		.exec(function(err, grocery) {
			if (err) { return next(err); }
			if (grocery===null) {  // No Results
				res.redirect('/inventory/grocery');
			}
			// Successful, so render
			res.render('grocery_delete', { title: 'Delete Grocery Product', grocery: grocery });
		});
};

// Handle Delete on POST
exports.grocery_delete_post = (req, res, next) => {
	Grocery.findByIdAndRemove(req.body.id, function deleteGroceryProduct(err) {
		if (err) { return next(err); }
		// Success - return to grocery item list
		res.redirect('/inventory/grocery');
	});
};

// Display update form on GET
exports.grocery_update_get = (req, res, next) => {
	// Get Grocery Product
	Grocery.findById(req.params.id, function(err, grocery) {
		if(err) { return next(err); }
		if(grocery===null) { // No Results
			const err = new Error('Grocery Product Not Found');
			err.status = 404;
			return next(err);
		}
		// Success
		res.render('grocery_create_form', { title: 'Update Grocery Product', grocery: grocery });
	});
};

// Handle update on POST
exports.grocery_update_post = [
	upload.single('grocery-img'),
	// Validate that all fields are not empty
	validator.body('brandname', 'Please include the Brandname!').trim().isLength({ min: 1 }),
	validator.body('product', 'Type of Produce required!').trim().isLength({ min: 1 }),
	// Sanitize all fields
	validator.sanitizeBody('brandname').escape(),
	validator.sanitizeBody('product').escape(),
	// Process Request after validation/sanitization
	(req, res, next) => {
		// Extract Errors
		const errors = validator.validationResult(req);

		// Create Grocery product with data(Include Old id)
		const grocery = new Grocery({
			brandname: req.body.brandname,
			product: req.body.product,
			price: req.body.price,
			quantity: req.body.quantity,
			img: { data: fs.readFileSync(req.file.path), contentType: req.file.mimetype },
			_id: req.params.id
		});

		if(!errors.isEmpty()) {
			// There are errors; render form again with sanitized values/ error messages
			res.render('grocery_create_form', { title: 'Update Grocery Product', grocery: grocery, errors: errors.array() });
			return;
		} else {
			// Data from form is valid; update the product
			Grocery.findByIdAndUpdate(req.params.id, grocery, {}, function(err, thegrocery) {
				if (err) { return next(err); }
				// Successful; redirect to grocery product detail page
				res.redirect(thegrocery.url);
			});
		}
	}	
];