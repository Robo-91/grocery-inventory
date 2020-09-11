const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProduceSchema = new Schema(
	{
		name: { type: String, required: true, minLength: 1, maxLength: 100 },
		price: { type: Number, required: true, min: 1 },
		type: { type: String, required: true, enum: ['Fruit', 'Vegetable'] },
		img: { data: Buffer, contentType: String }
	}
);

ProduceSchema
.virtual('produce_price')
.get(function() {
	return `$${this.price} / lb`;
});

ProduceSchema
.virtual('url')
.get(function() {
	return `/inventory/produce/${this._id}`;
});

module.exports = mongoose.model('Produce', ProduceSchema);