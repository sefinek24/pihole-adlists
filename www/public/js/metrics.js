import { formatDateShort, formatToYYYYMMDD } from './date.js';

const charts = {};
const START_DATE = new Date('2024-10-28');
const SUCCESS_CODES = ['200', '201', '204', '304'];
const ERROR_CODES = ['400', '401', '403', '404', '429', '500', '502', '503', '504'];
let dataAvailableDays = 0;
const FORMAT_LABELS = {
	hosts: 'hosts 0.0.0.0',
	localhost: 'localhost',
	adguard: 'AdGuard',
	dnsmasq: 'Dnsmasq',
	noip: 'No-IP',
	rpz: 'RPZ',
	unbound: 'Unbound',
};

const FORMAT_LABELS_SHORT = {
	hosts: '0.0.0.0',
	localhost: '127.0.0.1',
	adguard: 'AdGuard',
	dnsmasq: 'Dnsmasq',
	noip: 'No-IP',
	rpz: 'RPZ',
	unbound: 'Unbound',
};
let currentInterval = 10;

const FONT_FAMILY = '\'Cascadia Mono\', \'Calibri\', sans-serif';

const COLORS = {
	primary: '#0088cc',
	secondary: '#00a8fc',
	tertiary: '#0066aa',
	quaternary: '#0099dd',
	quinary: '#005588',
	orange: '#ff6b35',
	purple: '#9b59b6',
	green: '#27ae60',
	yellow: '#f39c12',
	red: '#e74c3c',
	teal: '#16a085',
};

const CHART_COLORS = [COLORS.primary, COLORS.green, COLORS.purple, COLORS.orange, COLORS.yellow, COLORS.teal, COLORS.red];

const UI_COLORS = {
	tooltipBg: 'rgba(0, 0, 0, 0.9)',
	tooltipTitle: '#00a8fc',
	tooltipBody: '#fff',
	tooltipBorder: 'rgba(0, 168, 252, 0.5)',
	tooltipFooter: 'rgba(255, 255, 255, 0.6)',
	textPrimary: 'rgba(255, 255, 255, 0.9)',
	textSecondary: 'rgba(255, 255, 255, 0.8)',
	gridLines: 'rgba(255, 255, 255, 0.08)',
	legendText: '#fff',
	borderDark: 'rgba(0, 0, 0, 0.5)',
	borderLight: '#fff',
};

const HEATMAP_COLORS = {
	empty: 'rgba(255, 255, 255, 0.05)',
	low: '39, 174, 96',
	medium: '243, 156, 18',
	high: '230, 126, 34',
	veryHigh: '231, 76, 60',
};

let loadingElement;
const showLoading = () => {
	if (!loadingElement) loadingElement = document.getElementById('loading');
	loadingElement.style.display = 'flex';
};
const hideLoading = () => {
	if (!loadingElement) loadingElement = document.getElementById('loading');
	loadingElement.style.display = 'none';
};

const updateElement = (id, value) => {
	const element = document.getElementById(id);
	if (element) element.textContent = value;
};

const addUTCFooter = callbacks => ({
	...callbacks,
	footer: callbacks.footer
		? ctx => {
			const customFooter = callbacks.footer(ctx);
			return customFooter ? `${customFooter}\nTime: UTC` : 'Time: UTC';
		}
		: () => 'Time: UTC',
});

const getTooltipConfig = (callbacks = {}) => ({
	enabled: true,
	backgroundColor: UI_COLORS.tooltipBg,
	titleColor: UI_COLORS.tooltipTitle,
	bodyColor: UI_COLORS.tooltipBody,
	borderColor: UI_COLORS.tooltipBorder,
	borderWidth: 1,
	padding: 12,
	displayColors: true,
	titleFont: {
		family: FONT_FAMILY,
		size: 14,
		weight: '600',
	},
	bodyFont: {
		family: FONT_FAMILY,
		size: 13,
	},
	footerFont: {
		family: FONT_FAMILY,
		size: 11,
	},
	footerColor: UI_COLORS.tooltipFooter,
	cornerRadius: 8,
	caretSize: 6,
	callbacks,
});

const getCommonChartOptions = (showLegend = true) => ({
	responsive: true,
	maintainAspectRatio: true,
	interaction: {
		mode: 'nearest',
		intersect: false,
	},
	animation: {
		duration: 750,
		easing: 'easeInOutQuart',
	},
	plugins: {
		legend: {
			display: showLegend,
			labels: {
				color: UI_COLORS.legendText,
				font: { family: FONT_FAMILY, size: 13, weight: '500' },
				padding: 15,
				usePointStyle: true,
				pointStyle: 'circle',
			},
		},
		tooltip: getTooltipConfig(),
	},
	scales: {
		x: {
			ticks: {
				color: UI_COLORS.textSecondary,
				font: { family: FONT_FAMILY, size: 12 },
			},
			grid: {
				color: UI_COLORS.gridLines,
				lineWidth: 1,
				drawBorder: false,
			},
		},
		y: {
			beginAtZero: true,
			ticks: {
				color: UI_COLORS.textSecondary,
				font: { family: FONT_FAMILY, size: 12 },
				callback: value => value.toLocaleString(),
			},
			grid: {
				color: UI_COLORS.gridLines,
				lineWidth: 1,
				drawBorder: false,
			},
		},
	},
});

const emptyCategories = {
	hosts: 0,
	localhost: 0,
	adguard: 0,
	dnsmasq: 0,
	noip: 0,
	rpz: 0,
	unbound: 0,
};

const destroyChart = name => {
	if (charts[name]) {
		charts[name].destroy();
		charts[name] = null;
	}
};

const aggregateByInterval = (data, intervalMinutes) => {
	if (intervalMinutes === 1) return data;

	const aggregated = {};
	const intervalMs = intervalMinutes * 60 * 1000;

	for (const item of data) {
		const timestamp = new Date(item.timestamp);
		const timestampMs = timestamp.getTime();
		const roundedMs = Math.floor(timestampMs / intervalMs) * intervalMs;
		const roundedTimestamp = new Date(roundedMs);

		const key = roundedTimestamp.toISOString();

		if (!aggregated[key]) {
			const dateStr = formatToYYYYMMDD(roundedTimestamp);
			const timeStr = `${String(roundedTimestamp.getHours()).padStart(2, '0')}:${String(roundedTimestamp.getMinutes()).padStart(2, '0')}`;

			aggregated[key] = {
				timestamp: roundedTimestamp.toISOString(),
				date: dateStr,
				time: timeStr,
				total: 0,
				blocklists: 0,
				categories: { ...emptyCategories },
				responses: {},
			};
		}

		aggregated[key].total += item.total || 0;
		aggregated[key].blocklists += item.blocklists || 0;

		if (item.categories) {
			for (const [cat, val] of Object.entries(item.categories)) {
				aggregated[key].categories[cat] = (aggregated[key].categories[cat] || 0) + (val || 0);
			}
		}

		if (item.responses) {
			for (const [code, count] of Object.entries(item.responses)) {
				aggregated[key].responses[code] = (aggregated[key].responses[code] || 0) + (count || 0);
			}
		}
	}

	return Object.values(aggregated).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
};

const calculateSuccessRate = (responses, total) => {
	if (!total) return '0.00';
	const successCount = SUCCESS_CODES.reduce((sum, code) => sum + (responses[code] || 0), 0);
	return ((successCount / total) * 100).toFixed(2);
};

const getMinInterval = days => {
	if (days === 'max' || days > 90) return 60;
	if (days > 30) return 15;
	if (days > 14) return 10;
	return 1;
};

let dateFromInputCached, dateToInputCached;
let intervalButtonsCached, quickButtonsCached;

const updateDateInputLimits = createdAt => {
	if (!dateFromInputCached) dateFromInputCached = document.getElementById('date-from');
	if (!dateToInputCached) dateToInputCached = document.getElementById('date-to');

	const today = new Date();
	const todayStr = formatToYYYYMMDD(today);

	let minDate;
	if (createdAt) {
		const createdDate = new Date(createdAt);
		minDate = formatToYYYYMMDD(createdDate);
	} else {
		minDate = formatToYYYYMMDD(START_DATE);
	}

	if (dateFromInputCached) {
		dateFromInputCached.setAttribute('min', minDate);
		dateFromInputCached.setAttribute('max', todayStr);
	}

	if (dateToInputCached) {
		dateToInputCached.setAttribute('min', minDate);
		dateToInputCached.setAttribute('max', todayStr);
	}
};

const updateDayButtons = () => {
	if (!quickButtonsCached) quickButtonsCached = document.querySelectorAll('.btn-quick');
	quickButtonsCached.forEach(btn => {
		const daysValue = btn.dataset.days;
		if (daysValue === 'max' || daysValue === '3') {
			btn.disabled = false;
			btn.style.opacity = '1';
			btn.style.cursor = 'pointer';
		} else {
			const requiredDays = parseInt(daysValue);
			if (requiredDays > dataAvailableDays) {
				btn.disabled = true;
				btn.style.opacity = '0.4';
				btn.style.cursor = 'not-allowed';
			} else {
				btn.disabled = false;
				btn.style.opacity = '1';
				btn.style.cursor = 'pointer';
			}
		}
	});
};

const loadAllTimeStats = async () => {
	try {
		const response = await fetch('/api/stats/alltime');
		if (!response.ok) throw new Error('Failed to fetch all-time stats');

		const { data: stats } = await response.json();

		updateElement('alltime-total', (stats.total || 0).toLocaleString());
		updateElement('alltime-blocklists', (stats.blocklists || 0).toLocaleString());

		const categories = stats.categories || {};
		const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
		const topCategoryName = topCategory ? (FORMAT_LABELS[topCategory[0]] || topCategory[0].toUpperCase()) : 'N/A';
		updateElement('alltime-top-category', topCategoryName);

		let daysSinceStart = 0;
		if (stats.createdAt) {
			const createdDate = new Date(stats.createdAt);
			const now = new Date();
			daysSinceStart = Math.max(0, Math.floor((now - createdDate) / (1000 * 60 * 60 * 24)));
			dataAvailableDays = daysSinceStart;
			updateElement('alltime-created', formatDateShort(stats.createdAt));
		} else {
			daysSinceStart = Math.max(0, Math.floor((new Date() - START_DATE) / (1000 * 60 * 60 * 24)));
			dataAvailableDays = daysSinceStart;
		}

		const avgPerDay = daysSinceStart > 0 ? Math.floor(stats.total / daysSinceStart) : 0;
		updateElement('alltime-avg', avgPerDay.toLocaleString());

		const successRate = calculateSuccessRate(stats.responses || {}, stats.total);
		updateElement('alltime-success-rate', `${successRate}%`);

		if (stats.updatedAt) updateElement('alltime-updated', formatDateShort(stats.updatedAt));

		updateDayButtons();
		updateDateInputLimits(stats.createdAt);
	} catch (err) {
		console.error('Error loading all-time stats:', err);
	}
};

const setDefaultDates = () => {
	if (!dateFromInputCached) dateFromInputCached = document.getElementById('date-from');
	if (!dateToInputCached) dateToInputCached = document.getElementById('date-to');

	const today = new Date();
	const sevenDaysAgo = new Date(today);
	sevenDaysAgo.setDate(today.getDate() - 7);

	if (dateFromInputCached) dateFromInputCached.value = formatToYYYYMMDD(sevenDaysAgo);
	if (dateToInputCached) dateToInputCached.value = formatToYYYYMMDD(today);
};

const fetchMetrics = async (from, to) => {
	try {
		showLoading();

		const response = await fetch(`/api/stats/minute?from=${from}&to=${to}&limit=10000`);
		if (!response.ok) throw new Error('Failed to fetch metrics');

		const data = await response.json();
		return data.data || [];
	} catch (err) {
		console.error('Error fetching metrics:', err);
		alert('Failed to load metrics. Please try again.');
		return [];
	} finally {
		hideLoading();
	}
};

const aggregateData = data => {
	let totalRequests = 0;
	let totalBlocklists = 0;
	const responses = {};
	const categories = {};
	const hourlyData = {};
	const uniqueDates = new Set();
	const allIntervals = [];
	let minTimestamp = Infinity;
	let maxTimestamp = -Infinity;

	data.forEach(item => {
		totalRequests += item.total || 0;
		totalBlocklists += item.blocklists || 0;
		uniqueDates.add(item.date);

		const timestamp = new Date(item.timestamp).getTime();
		if (timestamp < minTimestamp) minTimestamp = timestamp;
		if (timestamp > maxTimestamp) maxTimestamp = timestamp;

		allIntervals.push({
			time: `${item.date} ${item.time}`,
			count: item.total || 0,
		});

		for (const [code, count] of Object.entries(item.responses || {})) {
			responses[code] = (responses[code] || 0) + count;
		}

		for (const [cat, count] of Object.entries(item.categories || {})) {
			if (count > 0) {
				categories[cat] = (categories[cat] || 0) + count;
			}
		}

		const hour = item.time.split(':')[0];
		hourlyData[hour] = (hourlyData[hour] || 0) + item.total;
	});

	const top3Peaks = allIntervals
		.sort((a, b) => b.count - a.count)
		.slice(0, 3);

	const successCount = SUCCESS_CODES.reduce((sum, code) => sum + (responses[code] || 0), 0);
	const errorCount = ERROR_CODES.reduce((sum, code) => sum + (responses[code] || 0), 0);
	const successRate = totalRequests > 0 ? ((successCount / totalRequests) * 100).toFixed(2) : '0.00';
	const errorRate = totalRequests > 0 ? ((errorCount / totalRequests) * 100).toFixed(2) : '0.00';

	const timeRangeHours = data.length > 0 && minTimestamp !== Infinity ? (maxTimestamp - minTimestamp) / (1000 * 60 * 60) : 0;
	const avgPerHour = timeRangeHours > 0 ? Math.floor(totalRequests / timeRangeHours) : 0;
	const avgPerDay = uniqueDates.size > 0 ? Math.floor(totalRequests / uniqueDates.size) : 0;
	const blocklistShare = totalRequests > 0 ? ((totalBlocklists / totalRequests) * 100).toFixed(2) : '0.00';
	const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

	return {
		totalRequests,
		totalBlocklists,
		successRate,
		errorRate,
		top3Peaks,
		responses,
		categories,
		hourlyData,
		avgPerHour,
		avgPerDay,
		blocklistShare,
		uniqueDays: uniqueDates.size,
		topCategory: topCategory ? topCategory[0] : 'N/A',
	};
};

const updateSummary = aggregated => {
	updateElement('total-requests', aggregated.totalRequests.toLocaleString());
	updateElement('blocklist-requests', aggregated.totalBlocklists.toLocaleString());

	const topFormat = aggregated.topCategory;
	const topFormatCount = topFormat !== 'N/A' ? (aggregated.categories[topFormat] || 0) : 0;
	const topFormatName = topFormat !== 'N/A' ? (FORMAT_LABELS[topFormat] || topFormat.toUpperCase()) : 'N/A';

	updateElement('period-top-category', topFormatName);
	updateElement('top-format-title', topFormatName);
	updateElement('top-format-downloads', topFormatCount.toLocaleString());
	updateElement('top-format-label', 'Most downloaded');

	updateElement('success-rate', `${aggregated.successRate}%`);
	updateElement('error-rate', `${aggregated.errorRate}%`);
	updateElement('avg-per-hour', aggregated.avgPerHour.toLocaleString());
	updateElement('avg-per-day', aggregated.avgPerDay.toLocaleString());
	updateElement('blocklist-share', `${aggregated.blocklistShare}%`);
	updateElement('unique-days', aggregated.uniqueDays);

	const peakTimesContainer = document.getElementById('peak-times');
	if (peakTimesContainer) {
		if (aggregated.top3Peaks.length > 0) {
			peakTimesContainer.innerHTML = aggregated.top3Peaks
				.map((peak, index) => {
					const medal = ['🥇', '🥈', '🥉'][index];
					return `<span class="peak-item">${medal} ${peak.time} — ${peak.count.toLocaleString()} requests</span>`;
				})
				.join('');
		} else {
			peakTimesContainer.innerHTML = '<span class="peak-item">N/A</span>';
		}
	}
};

const createRequestsChart = data => {
	destroyChart('requests');

	const ctx = document.getElementById('requests-chart')?.getContext('2d');
	if (!ctx) return;

	const labels = data.map(d => `${d.date} ${d.time}`);

	const options = getCommonChartOptions();
	options.scales.x.ticks.maxTicksLimit = 20;
	options.scales.x.ticks.autoSkip = true;
	options.interaction = { mode: 'index', intersect: false };
	options.plugins.tooltip.callbacks = addUTCFooter({
		title: tooltipCtx => tooltipCtx[0].label,
		label: tooltipCtx => `${tooltipCtx.dataset.label}: ${tooltipCtx.parsed.y.toLocaleString()} requests`,
	});

	charts.requests = new Chart(ctx, {
		type: 'line',
		data: {
			labels,
			datasets: [
				{
					label: 'Total Requests',
					data: data.map(d => d.total || 0),
					borderColor: COLORS.primary,
					backgroundColor: COLORS.primary + '20',
					borderWidth: 2,
					fill: false,
					tension: 0.4,
					pointRadius: 0,
					pointBackgroundColor: COLORS.primary,
					pointBorderColor: COLORS.primary,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: COLORS.primary,
					pointHoverBorderColor: COLORS.primary,
					pointHoverBorderWidth: 2,
					pointBorderWidth: 1,
				},
				{
					label: 'Blocklist Requests',
					data: data.map(d => d.blocklists || 0),
					borderColor: COLORS.purple,
					backgroundColor: COLORS.purple + '20',
					borderWidth: 2,
					fill: false,
					tension: 0.4,
					pointRadius: 0,
					pointBackgroundColor: COLORS.purple,
					pointBorderColor: COLORS.purple,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: COLORS.purple,
					pointHoverBorderColor: COLORS.purple,
					pointHoverBorderWidth: 2,
					pointBorderWidth: 1,
				},
			],
		},
		options,
	});
};

const createResponsesChart = responses => {
	destroyChart('responses');

	const ctx = document.getElementById('responses-chart')?.getContext('2d');
	if (!ctx) return;

	const total = Object.values(responses).reduce((sum, val) => sum + val, 0);
	const colorValues = [COLORS.green, COLORS.primary, COLORS.yellow, COLORS.orange, COLORS.red];

	charts.responses = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: Object.keys(responses),
			datasets: [{
				data: Object.values(responses),
				backgroundColor: colorValues,
				hoverBackgroundColor: colorValues.map(c => c + 'dd'),
				borderWidth: 0,
				borderColor: colorValues.map(c => c + 'aa'),
				hoverBorderColor: colorValues,
				hoverBorderWidth: 2,
			}],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			animation: {
				animateRotate: true,
				animateScale: true,
				duration: 1000,
				easing: 'easeInOutQuart',
			},
			plugins: {
				legend: {
					display: true,
					position: 'right',
					labels: {
						color: UI_COLORS.legendText,
						font: { family: FONT_FAMILY, size: 13, weight: '500' },
						padding: 15,
						usePointStyle: true,
						pointStyle: 'circle',
					},
				},
				tooltip: getTooltipConfig({
					label: tooltipCtx => {
						const value = tooltipCtx.parsed;
						const percentage = ((value / total) * 100).toFixed(2);
						return `HTTP ${tooltipCtx.label}: ${value.toLocaleString()} (${percentage}%)`;
					},
				}),
			},
		},
	});
};

const createCategoriesChart = categories => {
	destroyChart('categories');

	const ctx = document.getElementById('categories-chart')?.getContext('2d');
	if (!ctx) return;

	const options = getCommonChartOptions(false);
	options.plugins.tooltip.callbacks = addUTCFooter({
		title: tooltipCtx => tooltipCtx[0].label,
		label: tooltipCtx => `Downloads: ${tooltipCtx.parsed.y.toLocaleString()}`,
	});
	options.scales.x.title = {
		display: true,
		text: 'Format',
		color: UI_COLORS.textPrimary,
		font: { family: FONT_FAMILY, size: 13, weight: '600' },
	};

	charts.categories = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: Object.keys(categories).map(key => FORMAT_LABELS_SHORT[key] || key.toUpperCase()),
			datasets: [{
				label: 'Downloads',
				data: Object.values(categories),
				backgroundColor: COLORS.green,
				hoverBackgroundColor: COLORS.green,
				borderWidth: 0,
				borderRadius: {
					topLeft: 6,
					topRight: 6,
					bottomLeft: 0,
					bottomRight: 0,
				},
				borderSkipped: 'bottom',
			}],
		},
		options,
	});
};

const createHourlyChart = (hourlyData, dateRange) => {
	destroyChart('hourly');

	const ctx = document.getElementById('hourly-chart')?.getContext('2d');
	if (!ctx) return;

	const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

	const options = getCommonChartOptions(false);
	options.plugins.tooltip.callbacks = addUTCFooter({
		title: tooltipCtx => tooltipCtx[0].label,
		label: tooltipCtx => `Requests: ${tooltipCtx.parsed.y.toLocaleString()}`,
		afterLabel: () => `Range: ${dateRange.from} → ${dateRange.to}`,
	});
	options.scales.x.title = {
		display: true,
		text: 'Hour of Day',
		color: UI_COLORS.textPrimary,
		font: { family: FONT_FAMILY, size: 13, weight: '600' },
	};

	charts.hourly = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: hours.map(h => `${h}:00`),
			datasets: [{
				label: 'Requests',
				data: hours.map(h => hourlyData[h] || 0),
				backgroundColor: COLORS.teal,
				hoverBackgroundColor: COLORS.teal,
				borderWidth: 0,
				borderRadius: {
					topLeft: 6,
					topRight: 6,
					bottomLeft: 0,
					bottomRight: 0,
				},
				borderSkipped: 'bottom',
			}],
		},
		options,
	});
};

const createDailyChart = data => {
	destroyChart('daily');

	const ctx = document.getElementById('daily-chart')?.getContext('2d');
	if (!ctx) return;

	const dailyData = {};
	data.forEach(item => {
		if (!dailyData[item.date]) dailyData[item.date] = { total: 0, blocklists: 0 };
		dailyData[item.date].total += item.total || 0;
		dailyData[item.date].blocklists += item.blocklists || 0;
	});

	const dates = Object.keys(dailyData).sort();

	const options = getCommonChartOptions();
	options.plugins.tooltip.callbacks = addUTCFooter({
		title: tooltipCtx => tooltipCtx[0].label,
		label: tooltipCtx => `${tooltipCtx.dataset.label}: ${tooltipCtx.parsed.y.toLocaleString()}`,
	});

	charts.daily = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: dates,
			datasets: [
				{
					label: 'Total Requests',
					data: dates.map(d => dailyData[d].total),
					backgroundColor: COLORS.primary,
					hoverBackgroundColor: COLORS.primary,
					borderWidth: 0,
					borderRadius: {
						topLeft: 6,
						topRight: 6,
						bottomLeft: 0,
						bottomRight: 0,
					},
					borderSkipped: 'bottom',
				},
				{
					label: 'Blocklist Downloads',
					data: dates.map(d => dailyData[d].blocklists),
					backgroundColor: COLORS.purple,
					hoverBackgroundColor: COLORS.purple,
					borderWidth: 0,
					borderRadius: {
						topLeft: 6,
						topRight: 6,
						bottomLeft: 0,
						bottomRight: 0,
					},
					borderSkipped: 'bottom',
				},
			],
		},
		options,
	});
};

const createPeakHoursChart = data => {
	destroyChart('peakHours');

	const ctx = document.getElementById('peak-hours-chart')?.getContext('2d');
	if (!ctx) return;

	const hourlyData = {};
	data.forEach(item => {
		const hour = item.time.split(':')[0];
		const key = `${item.date} ${hour}:00`;
		hourlyData[key] = (hourlyData[key] || 0) + (item.total || 0);
	});

	const sorted = Object.entries(hourlyData)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);

	const options = getCommonChartOptions(false);
	options.indexAxis = 'y';
	options.plugins.tooltip.callbacks = addUTCFooter({
		title: tooltipCtx => tooltipCtx[0].label,
		label: tooltipCtx => `Peak: ${tooltipCtx.parsed.x.toLocaleString()} requests`,
	});
	options.scales.x.title = {
		display: true,
		text: 'Number of Requests',
		color: UI_COLORS.textPrimary,
		font: { family: FONT_FAMILY, size: 13, weight: '600' },
	};

	charts.peakHours = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: sorted.map(([key]) => key),
			datasets: [{
				label: 'Requests',
				data: sorted.map(([, val]) => val),
				backgroundColor: COLORS.orange,
				hoverBackgroundColor: COLORS.orange,
				borderColor: COLORS.orange,
				borderWidth: 0,
				borderRadius: {
					topLeft: 0,
					topRight: 6,
					bottomLeft: 0,
					bottomRight: 6,
				},
				borderSkipped: 'left',
			}],
		},
		options,
	});
};

const createFormatDistributionChart = data => {
	destroyChart('formatDist');

	const ctx = document.getElementById('format-distribution-chart')?.getContext('2d');
	if (!ctx) return;

	const labels = data.map(d => `${d.date} ${d.time}`);
	const datasets = Object.keys(FORMAT_LABELS_SHORT).map((key, idx) => {
		const color = CHART_COLORS[idx % CHART_COLORS.length];
		return {
			label: FORMAT_LABELS_SHORT[key],
			data: data.map(d => d.categories?.[key] || 0),
			borderColor: color,
			backgroundColor: color + '33',
			borderWidth: 2,
			fill: false,
			tension: 0.4,
			pointRadius: 0,
			pointBackgroundColor: color,
			pointBorderColor: color,
			pointHoverRadius: 6,
			pointHoverBackgroundColor: color,
			pointHoverBorderColor: UI_COLORS.borderLight,
			pointHoverBorderWidth: 2,
			pointBorderWidth: 1,
		};
	});

	const options = getCommonChartOptions();
	options.interaction = {
		mode: 'index',
		intersect: false,
	};
	options.plugins.legend.position = 'bottom';
	options.plugins.tooltip.callbacks = addUTCFooter({
		title: tooltipCtx => tooltipCtx[0].label,
		label: tooltipCtx => `${tooltipCtx.dataset.label}: ${tooltipCtx.parsed.y.toLocaleString()} downloads`,
		afterBody: tooltipCtx => {
			const total = tooltipCtx.reduce((sum, item) => sum + item.parsed.y, 0);
			return `\nTotal: ${total.toLocaleString()} downloads`;
		},
	});
	options.scales.x.ticks.maxTicksLimit = 20;
	options.scales.x.ticks.autoSkip = true;

	charts.formatDist = new Chart(ctx, {
		type: 'line',
		data: { labels, datasets },
		options,
	});
};

const createHeatmapChart = data => {
	destroyChart('heatmap');

	const ctx = document.getElementById('heatmap-chart')?.getContext('2d');
	if (!ctx) return;

	const heatmapData = {};
	data.forEach(item => {
		const hour = item.time.split(':')[0];
		if (!heatmapData[item.date]) heatmapData[item.date] = {};
		heatmapData[item.date][hour] = (heatmapData[item.date][hour] || 0) + (item.total || 0);
	});

	const dates = Object.keys(heatmapData).sort();
	const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

	const matrix = [];
	dates.forEach(date => {
		hours.forEach((hour, hourIndex) => {
			const value = heatmapData[date]?.[hour] || 0;
			matrix.push({
				x: hourIndex,
				y: date,
				v: value,
				hour: hour,
			});
		});
	});

	const values = matrix.map(d => d.v);
	const maxValue = Math.max(...values, 1);

	const getColor = value => {
		if (value === 0 || maxValue === 0) return HEATMAP_COLORS.empty;
		const intensity = value / maxValue;
		if (intensity < 0.2) return `rgba(${HEATMAP_COLORS.low}, ${0.3 + intensity * 0.3})`;
		if (intensity < 0.5) return `rgba(${HEATMAP_COLORS.medium}, ${0.4 + intensity * 0.3})`;
		if (intensity < 0.8) return `rgba(${HEATMAP_COLORS.high}, ${0.5 + intensity * 0.3})`;
		return `rgba(${HEATMAP_COLORS.veryHigh}, ${0.6 + intensity * 0.4})`;
	};

	charts.heatmap = new Chart(ctx, {
		type: 'bubble',
		data: {
			datasets: [{
				label: 'Traffic Intensity',
				data: matrix.map(d => ({
					x: d.x,
					y: dates.indexOf(d.y),
					r: maxValue > 0 ? Math.sqrt(d.v / maxValue) * 15 + 3 : 3,
					value: d.v,
					hour: d.hour,
					date: d.y,
				})),
				backgroundColor: matrix.map(d => getColor(d.v)),
				borderColor: matrix.map(d => getColor(d.v)),
			}],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: { display: false },
				tooltip: getTooltipConfig({
					title: tooltipCtx => `${tooltipCtx[0].raw.date} ${tooltipCtx[0].raw.hour}:00`,
					label: tooltipCtx => `Requests: ${tooltipCtx.raw.value.toLocaleString()}`,
					footer: () => 'Time: UTC',
				}),
			},
			scales: {
				x: {
					type: 'linear',
					min: -0.5,
					max: 23.5,
					ticks: {
						stepSize: 1,
						callback: value => {
							const hour = hours[Math.round(value)];
							return hour ? hour + ':00' : '';
						},
						color: UI_COLORS.textSecondary,
						font: { family: FONT_FAMILY, size: 11 },
					},
					grid: {
						color: UI_COLORS.gridLines,
						lineWidth: 1,
					},
					title: {
						display: true,
						text: 'Hour of Day (UTC)',
						color: UI_COLORS.textPrimary,
						font: { family: FONT_FAMILY, size: 13, weight: '600' },
					},
				},
				y: {
					type: 'linear',
					min: -0.5,
					max: dates.length - 0.5,
					reverse: true,
					ticks: {
						stepSize: 1,
						callback: value => dates[value] || '',
						color: UI_COLORS.textSecondary,
						font: { family: FONT_FAMILY, size: 11 },
					},
					grid: { color: UI_COLORS.gridLines, lineWidth: 1 },
					title: {
						display: true,
						text: 'Date',
						color: UI_COLORS.textPrimary,
						font: { family: FONT_FAMILY, size: 13, weight: '600' },
					},
				},
			},
		},
	});
};

const loadData = async () => {
	if (!dateFromInputCached) dateFromInputCached = document.getElementById('date-from');
	if (!dateToInputCached) dateToInputCached = document.getElementById('date-to');

	const from = dateFromInputCached.value;
	const to = dateToInputCached.value;

	if (!from || !to) {
		alert('Please select both start and end dates');
		return;
	}

	const fromDate = new Date(from + 'T00:00:00');
	const toDate = new Date(to + 'T00:00:00');
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	if (fromDate > toDate) {
		alert('Start date cannot be after end date');
		return;
	}

	if (toDate > today) {
		alert('End date cannot be in the future');
		return;
	}

	const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));

	if (daysDiff < 0) {
		alert('Invalid date range');
		return;
	}

	const minInterval = getMinInterval(daysDiff);

	if (currentInterval < minInterval) {
		alert(`For ${daysDiff} days range, minimum interval is ${minInterval >= 60 ? (minInterval / 60) + 'h' : minInterval + 'm'}. Please select a larger interval.`);
		return;
	}

	const rawData = await fetchMetrics(from, to);
	if (!rawData.length) {
		alert('No data available for selected date range');
		return;
	}

	const data = aggregateByInterval(rawData, currentInterval);
	const aggregated = aggregateData(data);
	updateSummary(aggregated);

	createRequestsChart(data);
	createResponsesChart(aggregated.responses);
	createCategoriesChart(aggregated.categories);
	createHourlyChart(aggregated.hourlyData, { from, to });
	createDailyChart(data);
	createPeakHoursChart(data);
	createHeatmapChart(data);
	createFormatDistributionChart(data);
};

const updateIntervalButtons = days => {
	if (!intervalButtonsCached) intervalButtonsCached = document.querySelectorAll('.btn-interval');
	const minInterval = getMinInterval(days);
	const needsActiveUpdate = currentInterval < minInterval;
	let activeSet = false;

	intervalButtonsCached.forEach(btn => {
		const interval = parseInt(btn.dataset.interval);
		const isDisabled = interval < minInterval;

		btn.disabled = isDisabled;
		btn.style.opacity = isDisabled ? '0.4' : '1';
		btn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';

		if (needsActiveUpdate && !activeSet && interval === minInterval) {
			intervalButtonsCached.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			currentInterval = minInterval;
			localStorage.setItem('metrics_interval', currentInterval);
			activeSet = true;
		}
	});
};

const loadQuickData = async days => {
	if (!dateFromInputCached) dateFromInputCached = document.getElementById('date-from');
	if (!dateToInputCached) dateToInputCached = document.getElementById('date-to');

	const to = new Date();
	let from;

	if (days === 'max') {
		from = new Date(START_DATE);
	} else {
		from = new Date(to);
		from.setDate(to.getDate() - days);
	}

	if (dateFromInputCached) dateFromInputCached.value = formatToYYYYMMDD(from);
	if (dateToInputCached) dateToInputCached.value = formatToYYYYMMDD(to);

	updateIntervalButtons(days);
	await loadData();
};

const updateIntervalsForCustomRange = () => {
	if (!dateFromInputCached) dateFromInputCached = document.getElementById('date-from');
	if (!dateToInputCached) dateToInputCached = document.getElementById('date-to');

	const from = dateFromInputCached.value;
	const to = dateToInputCached.value;

	if (from) {
		dateToInputCached.setAttribute('min', from);
	}

	if (!from || !to) return;

	const fromDate = new Date(from + 'T00:00:00');
	const toDate = new Date(to + 'T00:00:00');

	if (fromDate > toDate) {
		dateToInputCached.value = from;
		return;
	}

	const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
	updateIntervalButtons(daysDiff);
};

const initializeEventListeners = () => {
	if (!dateFromInputCached) dateFromInputCached = document.getElementById('date-from');
	if (!dateToInputCached) dateToInputCached = document.getElementById('date-to');
	if (dateFromInputCached) dateFromInputCached.addEventListener('change', updateIntervalsForCustomRange);
	if (dateToInputCached) dateToInputCached.addEventListener('change', updateIntervalsForCustomRange);

	const loadDataBtn = document.getElementById('load-data');
	if (loadDataBtn) {
		loadDataBtn.addEventListener('click', () => {
			if (!quickButtonsCached) quickButtonsCached = document.querySelectorAll('.btn-quick');
			quickButtonsCached.forEach(btn => btn.classList.remove('active'));
			void loadData();
		});
	}
};

const quickButtons = document.querySelectorAll('.btn-quick');
const intervalButtons = document.querySelectorAll('.btn-interval');

quickButtons.forEach(btn => {
	btn.addEventListener('click', async e => {
		if (e.target.disabled) return;

		quickButtons.forEach(b => b.classList.remove('active'));
		e.target.classList.add('active');

		const daysValue = e.target.dataset.days;
		const days = daysValue === 'max' ? 'max' : (parseInt(daysValue) || 7);
		localStorage.setItem('metrics_days', days);
		await loadQuickData(days);
	});
});

intervalButtons.forEach(btn => {
	btn.addEventListener('click', async e => {
		if (e.target.disabled) return;

		intervalButtons.forEach(b => b.classList.remove('active'));
		e.target.classList.add('active');

		currentInterval = parseInt(e.target.dataset.interval) || 1;
		localStorage.setItem('metrics_interval', currentInterval);
		await loadData();
	});
});

const initializeMetrics = () => {
	const savedDaysRaw = localStorage.getItem('metrics_days');
	let savedDays = savedDaysRaw === 'max' ? 'max' : (parseInt(savedDaysRaw) || 7);
	let savedInterval = parseInt(localStorage.getItem('metrics_interval')) || 10;

	const validIntervals = [1, 5, 10, 15, 30, 60, 240, 480, 960, 1440];
	if (!validIntervals.includes(savedInterval)) {
		savedInterval = 10;
		localStorage.setItem('metrics_interval', savedInterval);
	}

	if (savedDays !== 'max' && ![3, 7, 14, 30, 90].includes(savedDays)) {
		savedDays = 7;
		localStorage.setItem('metrics_days', savedDays);
	}

	if (!quickButtonsCached) quickButtonsCached = document.querySelectorAll('.btn-quick');
	if (!intervalButtonsCached) intervalButtonsCached = document.querySelectorAll('.btn-interval');

	quickButtonsCached.forEach(btn => {
		const btnDays = btn.dataset.days === 'max' ? 'max' : parseInt(btn.dataset.days);
		if (btnDays === savedDays) {
			btn.classList.add('active');
		} else {
			btn.classList.remove('active');
		}
	});

	intervalButtonsCached.forEach(btn => {
		if (parseInt(btn.dataset.interval) === savedInterval) {
			btn.classList.add('active');
		} else {
			btn.classList.remove('active');
		}
	});

	currentInterval = savedInterval;

	initializeEventListeners();
	setDefaultDates();
	void loadAllTimeStats();
	updateIntervalButtons(savedDays);
	void loadQuickData(savedDays);
};

initializeMetrics();
