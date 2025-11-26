const { Schema, model } = require('mongoose');

const MinuteStatsSchema = new Schema({
	timestamp: { type: Date, required: true },
	date: { type: String, required: true }, // YYYY-MM-DD
	time: { type: String, required: true }, // HH:mm

	total: { type: Number, default: 0 },
	blocklists: { type: Number, default: 0 },

	categories: {
		'0000': { type: Number, default: 0 },
		'127001': { type: Number, default: 0 },
		adguard: { type: Number, default: 0 },
		dnsmasq: { type: Number, default: 0 },
		noip: { type: Number, default: 0 },
		rpz: { type: Number, default: 0 },
		unbound: { type: Number, default: 0 },
	},

	responses: { type: Map, of: Number, default: () => ({}) },
}, { timestamps: false, versionKey: false });

MinuteStatsSchema.index({ date: 1, time: 1 }, { unique: true });
MinuteStatsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = model('MinuteStats', MinuteStatsSchema, 'minute-stats');
