const validator = require('express-validator');
const Dairy = require('../models/dairy');
const async = require('async');
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

// Set Up Index(Home) page
exports.index = (req, res) => {
	res.render('index', { title: 'Grocery Inventory Home Page' });
};

// Display all dairy products
exports.dairy_list = (req, res, next) => {
	Dairy.find()
		.exec(function (err, list_dairy) {
			if (err) { return next(err); }
			// Successful, render
			res.render('dairy_list', { title: 'Dairy Items', dairy_list: list_dairy });
		});
};

// Display detail page of dairy product
exports.dairy_item = (req, res, next) => {
	Dairy.findById(req.params.id)
		.exec(function(err, dairy) {
			if (err) { return next(err); }
			if (dairy===null) {  // No Results
				const err = new Error('Dairy Item not found');
				err.status = 404;
				return next(err);
			}
			// Successful, so render.
			res.render('dairy_detail', { title: 'Dairy Item Details', dairy: dairy });
		});
};

// Display create form on GET
exports.dairy_create_get = (req, res, next) => {
	res.render('dairy_create_form', { title: 'Create Dairy Product' });
};

// Handle create form on POST
exports.dairy_create_post = [
	upload.single('img'),
	// Validate that all fields are not empty
	validator.body('brandname', 'Brandname Required!').trim().isLength({ min: 2 }),
	validator.body('product', 'Type of Product Required!').trim().isLength({ min: 2 }),
	// Sanitize all fields
	validator.sanitizeBody('brandname').escape(),
	validator.sanitizeBody('product').escape(),
	// Process after validation and Sanitization
	(req, res, next) => {
		// Extract any errors from request
		const errors = validator.validationResult(req);
		// Create a new dairy object with data
		const dairy = new Dairy({
			brandname: req.body.brandname,
			product: req.body.product,
			price: req.body.price,
			img: { data: fs.readFileSync(req.file.path), contentType: req.file.mimetype }
		});

		if(!errors.isEmpty()) {
			// There are errors, render form again with sanitized values/ error messages
			res.render('dairy_create_form', { title: 'Create Dairy Product', dairy: dairy, errors: errors.array() });
			return;
		} else {
			// Data from form is valid
			// Make sure the dairy product doesn't already exist
			Dairy.findOne({ 'product': req.body.product })
				.exec(function(err, found_dairy) {
					if (err) { return next(err); }
					if (found_dairy) {
						// the product exists, redirect to its detail page
						res.redirect(found_dairy.url);
					} 
					else {
						dairy.save(function(err) {
							if (err) { return next(err); }
							// product saved, redirect to its detail page.
							res.redirect(dairy.url);
						});
					}
				});
		}
	}
];

// Display delete form on GET
exports.dairy_delete_get = (req, res, next) => {
	Dairy.findById(req.params.id)
		.exec(function(err, dairy) {
			if (err) { return next(err); }
			if (dairy===null) {	// No Results
				res.redirect('/inventory/dairy');
			}
			// Successful, so render
			res.render('dairy_delete', { title: 'Delete Dairy Product', dairy: dairy });
		});
};

// Handle Delete on POST
exports.dairy_delete_post = (req, res, next) => {
	Dairy.findByIdAndRemove(req.body.id, function deleteDairyProduct(err) {
		if (err) { return next(err); }
		// Success - redirect to list
		res.redirect('/inventory/dairy');
	});
};

// Display update form on GET
exports.dairy_update_get = (req, res, next) => {
	// Get Dairy Product
	Dairy.findById(req.params.id, function(err, dairy) {
		if (err) { return next(err); }
		if (dairy===null) { // No Results
			const err = new Error('Dairy Product Not Found');
			err.status = 404;
			return next(err);
		}
		// Success
		res.render('dairy_create_form', { title: 'Update Dairy Product', dairy: dairy });
	});
};

// Handle update on POST
exports.dairy_update_post = [
	upload.single('img'),
	// Validate Fields
	validator.body('brandname', 'Brandname Required!').trim().isLength({ min: 2 }),
	validator.body('product', 'Type of Product Required!').trim().isLength({ min: 2 }),
	// Sanitize Fields
	validator.sanitizeBody('brandname').escape(),
	validator.sanitizeBody('product').escape(),
	// Process request after validation/sanitization
	(req, res, next) => {
		// Extract possible errors
		const errors = validator.validationResult(req);

		// Create dairy product with trimmed data (include old id!!)
		const dairy = new Dairy({
			brandname: req.body.brandname,
			product: req.body.product,
			price: req.body.price,
			img: { data: fs.readFileSync(req.file.path), contentType: req.file.mimetype },
			_id: req.params.id
		});

		if(!errors.isEmpty()) {
			// There are errors: Render form again with sanitized values/ error messages
			res.render('dairy_create_form', { title: 'Update Dairy Product', dairy: dairy, errors: errors.array() });
			return;
		} else {
			// Data from the form is valid; update the product
			Dairy.findByIdAndUpdate(req.params.id, dairy, {}, function(err, thedairy) {
				if (err) { return next(err); }
				// Successful - redirect to dairy product detail page.
				res.redirect(thedairy.url);
			});
		}
	}
];