const validator = require('express-validator');
const Produce = require('../models/produce');
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

// Display all produce products
exports.produce_list = (req, res, next) => {
	Produce.find()
		.exec((err, list_produce) => {
			if (err) { return next(err); }
			// Successful, render.
			res.render('produce_list', { title: 'Produce Items', produce_list: list_produce });
		});	
};

// Display detail page of dairy product
exports.produce_item = (req, res) => {
	Produce.findById(req.params.id)
		.exec(function(err, produce) {
			if (err) { return next(err); }
			if (produce===null) { // No results
				const err = new Error('Produce Item not found');
				err.status = 404;
				return next(err);
			}
			// Successful; render
			res.render('produce_detail', { title: 'Produce Item Details', produce: produce });
		});
};

// Display create form on GET
exports.produce_create_get = (req, res, next) => {
	res.render('produce_create_form', { title:'Create Produce Product' });
};

// Handle create form on POST
exports.produce_create_post = [
	upload.single('img'),
	// Validate that appropriate fields are not empty
	validator.body('name', 'You must include Name of Product!').trim().isLength({ min: 1 }),
	validator.body('type', 'Type must be either Fruit or Vegetable!').trim(),
	// Sanitize fields
	validator.sanitizeBody('name').escape(),
	validator.sanitizeBody('type').escape(),
	// Process after fields are validated/sanitized
	(req, res, next) => {
		// Extract errors from request
		const errors = validator.validationResult(req);
		// create new produce product with data
		const produce = new Produce({
			name: req.body.name,
			price: req.body.price,
			type: req.body.type,
			img: { data: fs.readFileSync(req.file.path), contentType: req.file.mimetype }
		});

		if(!errors.isEmpty()) {
			// there are errors; render create form again with values/ messages
			res.render('product_create_form', { title: 'Create Produce Produce', produce: produce, errors: errors.array() });
			return;
		} else {
			// Data from the form is valid
			// make sure the produce product doesn't already exist
			Produce.findOne({ 'name': req.body.name })
				.exec(function(err, found_produce) {
					if (err) { return next(err); }
					if (found_produce) {
						// redirect to the found product detail page
						res.redirect(found_produce.url);
					}
					else {
						produce.save(function(err) {
							if (err) { return next(err); }
							// product is saved, redirect to its url
							res.redirect(produce.url);
						});
					}
				});
		}
	}
];

// Display delete form on GET
exports.produce_delete_get = (req, res, next) => {
	Produce.findById(req.params.id)
		.exec(function(err, produce) {
			if (err) { return next(err); }
			if (produce===null) { // No Results
				res.redirect('/inventory/produce');
			}
			// Successful; Render page
			res.render('produce_delete', { title: 'Delete Produce Product', produce: produce });
		});
};

// Handle Delete on POST
exports.produce_delete_post = (req, res, next) => {
	Produce.findByIdAndRemove(req.body.id, function deleteProduceProduct(err) {
		if (err) { return next(err); }
		// Success - return to product item list
		res.redirect('/inventory/produce');
	});
};

// Display update form on GET
exports.produce_update_get = (req, res, next) => {
	Produce.findById(req.params.id, function(err, produce) {
		if (err) { return next(err); }
		if (produce===null) { // No Result
			const err = new Error('Produce Product Not Found');
			err.status = 404;
			return next(err);
		}
		// Success
		res.render('produce_create_form', { title: 'Update Produce Product', produce: produce });
	})
};

// Handle update on POST
exports.produce_update_post = [
	upload.single('img'),
	// Validate that appropriate fields are not empty
	validator.body('name', 'You must include Name of Product!').trim().isLength({ min: 1 }),
	validator.body('type', 'Type must be either Fruit or Vegetable!').trim(),
	// Sanitize fields
	validator.sanitizeBody('name').escape(),
	validator.sanitizeBody('type').escape(),
	// Process after fields are validated/sanitized
	(req, res, next) => {
		// Extract any possible errors
		const errors = validator.validationResult(req);
		// create new produce product from user input
		const produce = new Produce({
			name: req.body.name,
			price: req.body.price,
			type: req.body.type,
			img:  { data: fs.readFileSync(req.file.path), contentType: req.file.mimetype },
			_id: req.params.id
		});

		if(!errors.isEmpty()) {
			// there are errors; render form again with values/ error messages
			res.render('produce_create_form', { title: 'Update Produce Product', produce: produce, errors: errors.array() });
			return;
		} else {
			// Data from the form is valid; update produce product
			Produce.findByIdAndUpdate(req.params.id, produce, {}, function(err, theproduce) {
				if (err) { return next(err); }
				// Successful; redirect to produce product's detail page
				res.redirect(theproduce.url);
			});
		}
	}
];