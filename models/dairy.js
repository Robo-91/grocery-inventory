const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const DairySchema = new Schema(
	{
		brandname: { type: String, required: true, minLength: 1, maxLength: 100 },
		product: { type: String, required: true, minLength: 1, maxLength: 100 },
		price: { type: Number },
		img: { data: Buffer, contentType: String }
	}
);

DairySchema
.virtual('url')
.get(function() {
	return `/inventory/dairy/${this._id}`;
});

DairySchema
.virtual('dairy_item_price')
.get(function() {
	return `$${this.price}`;
});

module.exports = mongoose.model('Dairy', DairySchema);