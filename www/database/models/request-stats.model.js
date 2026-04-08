const { Schema, model } = require('mongoose');

const CategoriesSchema = new Schema({
	hosts: { type: Number, default: 0 },
	localhost: { type: Number, default: 0 },
	adguard: { type: Number, default: 0 },
	dnsmasq: { type: Number, default: 0 },
	noip: { type: Number, default: 0 },
	rpz: { type: Number, default: 0 },
	unbound: { type: Number, default: 0 },
}, { timestamps: false, _id: false });

const StatsSchema = new Schema({
	total: { type: Number, default: 0 },
	blocklists: { type: Number, default: 0 },

	categories: { type: CategoriesSchema, default: () => ({}) },
	responses: { type: Map, of: Number, default: () => ({}) },
}, { timestamps: true, versionKey: false, collection: 'request-stats' });

module.exports = model('RequestStats', StatsSchema);
module.exports.CategoriesSchema = CategoriesSchema;