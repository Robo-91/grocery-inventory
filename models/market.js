const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MarketSchema = new Schema(
	{
		name: { type: String, required: true, minLength: 1, maxLength: 100 },
		price: { type: Number, required: true, min: 1 },
		usda: { type: String, required: true, enum: ['Prime', 'Select', 'None'] },
		quantity: { type: Number },
		img: { data: Buffer, contentType: String }
	}
);

MarketSchema
.virtual('url')
.get(function() {
	return `/inventory/market/${this._id}`;
});

MarketSchema
.virtual('market_price')
.get(function() {
	return `$${this.price} / lb`;
});

module.exports = mongoose.model('Market', MarketSchema);

