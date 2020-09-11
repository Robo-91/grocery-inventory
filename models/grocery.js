const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GrocerySchema = new Schema(
	{
		brandname: { type: String, required: true, minLength: 1, maxLength: 100 },
		product: { type: String, required: true, minLength: 1, maxLength: 100 },
		price: { type: Number, required: true, min: 1 },
		quantity: { type: Number },
		img: { data: Buffer, contentType: String }
	}
);

// Virtual for Grocery URL
GrocerySchema
.virtual('url')
.get(function() {
	return `/inventory/grocery/${this._id}`; 
});

GrocerySchema
.virtual('grocery_item_price')
.get(function() {
	return `$${this.price}`;
});

module.exports = mongoose.model('Grocery', GrocerySchema);