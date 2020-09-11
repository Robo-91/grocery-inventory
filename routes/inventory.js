const express = require('express');
const router = express.Router();

// Controller modules
const dairy_controller = require('../controllers/dairyController');
const grocery_controller = require('../controllers/groceryController');
const market_controller = require('../controllers/marketController');
const produce_controller = require('../controllers/produceController');

// Dairy Routes

// Home Page
router.get('/', dairy_controller.index);

// GET request - create dairy item
router.get('/dairy/create', dairy_controller.dairy_create_get);

// POST request - create dairy item
router.post('/dairy/create', dairy_controller.dairy_create_post);

// GET request - delete dairy item
router.get('/dairy/:id/delete', dairy_controller.dairy_delete_get);

// POST request - delete dairy item
router.post('/dairy/:id/delete', dairy_controller.dairy_delete_post);

// GET request - update dairy item
router.get('/dairy/:id/update', dairy_controller.dairy_update_get);

// POST request - update dairy item
router.post('/dairy/:id/update', dairy_controller.dairy_update_post);

// Get request - dairy item
router.get('/dairy/:id', dairy_controller.dairy_item);

// Get request - dairy list
router.get('/dairy', dairy_controller.dairy_list);

// Grocery Routes

// GET request - create grocery item
router.get('/grocery/create', grocery_controller.grocery_create_get);

// POST request - create grocery item
router.post('/grocery/create', grocery_controller.grocery_create_post);

// GET request - delete groceryitem
router.get('/grocery/:id/delete', grocery_controller.grocery_delete_get);

// POST request - delete grocery item
router.post('/grocery/:id/delete', grocery_controller.grocery_delete_post);

// GET request - update grocery item
router.get('/grocery/:id/update', grocery_controller.grocery_update_get);

// POST request - update grocery item
router.post('/grocery/:id/update', grocery_controller.grocery_update_post);

// Get request - grocery item
router.get('/grocery/:id', grocery_controller.grocery_item);

// Get request - grocery list
router.get('/grocery', grocery_controller.grocery_list);

// Market Routes

// GET request - create market item
router.get('/market/create', market_controller.market_create_get);

// POST request - create market item
router.post('/market/create', market_controller.market_create_post);

// GET request - delete market item
router.get('/market/:id/delete', market_controller.market_delete_get);

// POST request - delete market item
router.post('/market/:id/delete', market_controller.market_delete_post);

// GET request - update market item
router.get('/market/:id/update', market_controller.market_update_get);

// POST request - update market item
router.post('/market/:id/update', market_controller.market_update_post);

// Get request - market item
router.get('/market/:id', market_controller.market_item);

// Get request - market list
router.get('/market', market_controller.market_list);

// Produce Routes

// GET request - create produce item
router.get('/produce/create', produce_controller.produce_create_get);

// POST request - create produce item
router.post('/produce/create', produce_controller.produce_create_post);

// GET request - delete produce item
router.get('/produce/:id/delete', produce_controller.produce_delete_get);

// POST request - delete produce item
router.post('/produce/:id/delete', produce_controller.produce_delete_post);

// GET request - update produce item
router.get('/produce/:id/update', produce_controller.produce_update_get);

// POST request - update produce item
router.post('/produce/:id/update', produce_controller.produce_update_post);

// Get request - produce item
router.get('/produce/:id', produce_controller.produce_item);

// Get request - produce list
router.get('/produce', produce_controller.produce_list);

module.exports = router;