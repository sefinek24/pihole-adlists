const Marked = require('marked');
const { CronExpressionParser } = require('cron-parser');
const { getFullDate } = require('../utils/time.js');
const { version } = require('../../package.json');
const Stats = require('../database/models/request-stats.model');

Marked.use({ pedantic: false, gfm: true });

const UPDATE_SCHEDULE = {
	timeZone: 'Europe/Warsaw',
	githubCron: '0 */3 * * *',
	localCron: '0 1,6 * * *',
	localTimes: ['01:00', '06:00'],
	localCronNote: 'at minute 0, past hours 1 and 6',
};

const normalizeOffsetLabel = value => {
	if (!value) return value;
	const match = value.match(/(GMT|UTC)([+-])(\d{1,2})(?::(\d{2}))?/);
	if (!match) return value;
	const hours = match[3].padStart(2, '0');
	const minutes = (match[4] || '00').padStart(2, '0');
	return `GMT${match[2]}${hours}:${minutes}`;
};

const getTimeZoneOffset = (timeZone, date = new Date()) => {
	try {
		const parts = new Intl.DateTimeFormat('en', {
			timeZone,
			timeZoneName: 'shortOffset',
		}).formatToParts(date);
		const tzPart = parts.find(part => part.type === 'timeZoneName');
		if (tzPart?.value) return normalizeOffsetLabel(tzPart.value);
	} catch {
		// ...
	}

	try {
		const parts = new Intl.DateTimeFormat('en', {
			timeZone,
			timeZoneName: 'short',
		}).formatToParts(date);
		const tzPart = parts.find(part => part.type === 'timeZoneName');
		if (tzPart?.value) return tzPart.value;
	} catch {
		// Keep fallback below.
	}

	return timeZone;
};

exports.index = async (req, res) => {
	const db = await Stats.findOne({}).lean();
	res.render('index.ejs', { version, db, uptime: getFullDate(process.uptime()) });
};

exports.falsePositives = (req, res) => res.render('false-positives.ejs');

exports.updateSchedule = (req, res) => {
	const tzOptions = { tz: UPDATE_SCHEDULE.timeZone, currentDate: Date.now() };
	const github = CronExpressionParser.parse(UPDATE_SCHEDULE.githubCron, tzOptions);
	const remote = CronExpressionParser.parse(UPDATE_SCHEDULE.localCron, tzOptions);

	res.render('update-schedule.ejs', {
		cron: { github: github.next().toISOString(), remote: remote.next().toISOString() },
		sync: {
			cron: UPDATE_SCHEDULE.localCron,
			cronNote: UPDATE_SCHEDULE.localCronNote,
			times: UPDATE_SCHEDULE.localTimes,
			timeZone: UPDATE_SCHEDULE.timeZone,
			timeZoneOffset: getTimeZoneOffset(UPDATE_SCHEDULE.timeZone),
		},
		version,
	});
};