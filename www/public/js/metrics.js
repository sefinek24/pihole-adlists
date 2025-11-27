const charts = {};
const START_DATE = new Date('2024-10-28');
const SUCCESS_CODES = ['200', '201', '204', '304'];
const ERROR_CODES = ['400', '401', '403', '404', '429', '500', '502', '503', '504'];
let currentInterval = 10; // Default 10 minutes

const showLoading = () => document.getElementById('loading').style.display = 'flex';
const hideLoading = () => document.getElementById('loading').style.display = 'none';

const formatDate = date => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
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
				color: '#fff',
				font: {
					family: "'Cascadia Mono', 'Calibri', sans-serif",
					size: 13,
					weight: '500',
				},
				padding: 15,
				usePointStyle: true,
				pointStyle: 'circle',
			},
		},
		tooltip: {
			enabled: true,
			backgroundColor: 'rgba(0, 0, 0, 0.9)',
			titleColor: '#00a8fc',
			bodyColor: '#fff',
			borderColor: 'rgba(0, 168, 252, 0.5)',
			borderWidth: 1,
			padding: 12,
			displayColors: true,
			titleFont: {
				family: "'Cascadia Mono', 'Calibri', sans-serif",
				size: 14,
				weight: '600',
			},
			bodyFont: {
				family: "'Cascadia Mono', 'Calibri', sans-serif",
				size: 13,
			},
			footerFont: {
				family: "'Cascadia Mono', 'Calibri', sans-serif",
				size: 11,
			},
			footerColor: 'rgba(255, 255, 255, 0.6)',
			cornerRadius: 8,
			caretSize: 6,
		},
	},
	scales: {
		x: {
			ticks: {
				color: 'rgba(255, 255, 255, 0.8)',
				font: {
					family: "'Cascadia Mono', 'Calibri', sans-serif",
					size: 12,
				},
			},
			grid: {
				color: 'rgba(255, 255, 255, 0.08)',
				lineWidth: 1,
				drawBorder: false,
			},
		},
		y: {
			beginAtZero: true,
			ticks: {
				color: 'rgba(255, 255, 255, 0.8)',
				font: {
					family: "'Cascadia Mono', 'Calibri', sans-serif",
					size: 12,
				},
				callback: value => value.toLocaleString(),
			},
			grid: {
				color: 'rgba(255, 255, 255, 0.08)',
				lineWidth: 1,
				drawBorder: false,
			},
		},
	},
});

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
			const dateStr = formatDate(roundedTimestamp);
			const timeStr = `${String(roundedTimestamp.getHours()).padStart(2, '0')}:${String(roundedTimestamp.getMinutes()).padStart(2, '0')}`;

			aggregated[key] = {
				timestamp: roundedTimestamp.toISOString(),
				date: dateStr,
				time: timeStr,
				total: 0,
				blocklists: 0,
				categories: {
					hosts: 0,
					localhost: 0,
					adguard: 0,
					dnsmasq: 0,
					noip: 0,
					rpz: 0,
					unbound: 0,
				},
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

const loadAllTimeStats = async () => {
	try {
		const response = await fetch('/api/stats/alltime');
		if (!response.ok) throw new Error('Failed to fetch all-time stats');

		const { data: stats } = await response.json();

		updateElement('alltime-total', (stats.total || 0).toLocaleString());
		updateElement('alltime-blocklists', (stats.blocklists || 0).toLocaleString());

		const categories = stats.categories || {};
		const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
		updateElement('alltime-top-category', topCategory ? topCategory[0].toUpperCase() : 'N/A');

		const daysSinceStart = Math.floor((new Date() - START_DATE) / (1000 * 60 * 60 * 24));
		const avgPerDay = daysSinceStart > 0 ? Math.floor(stats.total / daysSinceStart) : 0;
		updateElement('alltime-avg', avgPerDay.toLocaleString());

		const successRate = calculateSuccessRate(stats.responses || {}, stats.total);
		updateElement('alltime-success-rate', `${successRate}%`);
	} catch (err) {
		console.error('Error loading all-time stats:', err);
	}
};

const setDefaultDates = () => {
	const today = new Date();
	const twoWeeksAgo = new Date(today);
	twoWeeksAgo.setDate(today.getDate() - 14);

	document.getElementById('date-from').value = formatDate(twoWeeksAgo);
	document.getElementById('date-to').value = formatDate(today);
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

	data.forEach(item => {
		totalRequests += item.total || 0;
		totalBlocklists += item.blocklists || 0;
		uniqueDates.add(item.date);

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

	const avgPerHour = data.length > 0 ? Math.floor(totalRequests / (data.length / 60)) : 0;
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
		uniqueDays: uniqueDates.size,
		topCategory: topCategory ? topCategory[0] : 'N/A',
	};
};

const updateSummary = aggregated => {
	updateElement('total-requests', aggregated.totalRequests.toLocaleString());
	updateElement('blocklist-requests', aggregated.totalBlocklists.toLocaleString());
	updateElement('success-rate', `${aggregated.successRate}%`);
	updateElement('error-rate', `${aggregated.errorRate}%`);
	updateElement('avg-per-hour', aggregated.avgPerHour.toLocaleString());
	updateElement('unique-days', aggregated.uniqueDays);
	updateElement('period-top-category', aggregated.topCategory.toUpperCase());

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
		title: ctx => ctx[0].label,
		label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} requests`,
	});

	charts.requests = new Chart(ctx, {
		type: 'line',
		data: {
			labels,
			datasets: [
				{
					label: 'Total Requests',
					data: data.map(d => d.total || 0),
					borderColor: '#667eea',
					backgroundColor: '#667eea26',
					borderWidth: 2,
					fill: true,
					tension: 0.4,
					pointRadius: 0,
					pointBackgroundColor: '#667eea',
					pointBorderColor: '#667eea',
					pointHoverRadius: 5,
					pointHoverBackgroundColor: '#667eea',
					pointHoverBorderColor: '#fff',
					pointHoverBorderWidth: 2,
					pointBorderWidth: 1,
				},
				{
					label: 'Blocklist Requests',
					data: data.map(d => d.blocklists || 0),
					borderColor: '#764ba2',
					backgroundColor: '#764ba226',
					borderWidth: 2,
					fill: true,
					tension: 0.4,
					pointRadius: 0,
					pointBackgroundColor: '#764ba2',
					pointBorderColor: '#764ba2',
					pointHoverRadius: 5,
					pointHoverBackgroundColor: '#764ba2',
					pointHoverBorderColor: '#fff',
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

	const colors = [
		'#667eea',
		'#764ba2',
		'#ed64a6',
		'#ff9a9e',
		'#fad0c4',
	];

	const hoverColors = [
		'#5568d3',
		'#6a4292',
		'#dc5395',
		'#ff8a8e',
		'#f9c0b4',
	];

	const total = Object.values(responses).reduce((sum, val) => sum + val, 0);

	charts.responses = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: Object.keys(responses),
			datasets: [{
				data: Object.values(responses),
				backgroundColor: colors,
				hoverBackgroundColor: hoverColors,
				borderWidth: 1,
				borderColor: 'rgba(0, 0, 0, 0.5)',
				hoverBorderColor: '#fff',
				hoverBorderWidth: 1,
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
						color: '#fff',
						font: {
							family: "'Cascadia Mono', 'Calibri', sans-serif",
							size: 13,
							weight: '500',
						},
						padding: 15,
						usePointStyle: true,
						pointStyle: 'circle',
					},
				},
				tooltip: {
					enabled: true,
					backgroundColor: 'rgba(0, 0, 0, 0.9)',
					titleColor: '#00a8fc',
					bodyColor: '#fff',
					borderColor: 'rgba(0, 168, 252, 0.5)',
					borderWidth: 1,
					padding: 12,
					displayColors: true,
					titleFont: {
						family: "'Cascadia Mono', 'Calibri', sans-serif",
						size: 14,
						weight: '600',
					},
					bodyFont: {
						family: "'Cascadia Mono', 'Calibri', sans-serif",
						size: 13,
					},
					cornerRadius: 8,
					callbacks: {
						label: ctx => {
							const value = ctx.parsed;
							const percentage = ((value / total) * 100).toFixed(2);
							return `HTTP ${ctx.label}: ${value.toLocaleString()} (${percentage}%)`;
						},
					},
				},
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
		title: ctx => ctx[0].label.toUpperCase(),
		label: ctx => `Downloads: ${ctx.parsed.y.toLocaleString()}`,
	});
	options.scales.x.title = {
		display: true,
		text: 'Format',
		color: 'rgba(255, 255, 255, 0.9)',
		font: {
			family: "'Cascadia Mono', 'Calibri', sans-serif",
			size: 13,
			weight: '600',
		},
	};

	charts.categories = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: Object.keys(categories),
			datasets: [{
				label: 'Downloads',
				data: Object.values(categories),
				backgroundColor: '#667eea',
				hoverBackgroundColor: '#5568d3',
				borderColor: '#5568d3',
				borderWidth: 1,
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
		title: ctx => ctx[0].label,
		label: ctx => `Requests: ${ctx.parsed.y.toLocaleString()}`,
		afterLabel: () => `Range: ${dateRange.from} → ${dateRange.to}`,
	});
	options.scales.x.title = {
		display: true,
		text: 'Hour of Day',
		color: 'rgba(255, 255, 255, 0.9)',
		font: {
			family: "'Cascadia Mono', 'Calibri', sans-serif",
			size: 13,
			weight: '600',
		},
	};

	charts.hourly = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: hours.map(h => `${h}:00`),
			datasets: [{
				label: 'Requests',
				data: hours.map(h => hourlyData[h] || 0),
				backgroundColor: '#764ba2',
				hoverBackgroundColor: '#6a4292',
				borderColor: '#6a4292',
				borderWidth: 1,
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
		if (!dailyData[item.date]) {
			dailyData[item.date] = { total: 0, blocklists: 0 };
		}
		dailyData[item.date].total += item.total || 0;
		dailyData[item.date].blocklists += item.blocklists || 0;
	});

	const dates = Object.keys(dailyData).sort();

	const options = getCommonChartOptions();
	options.plugins.tooltip.callbacks = addUTCFooter({
		title: ctx => ctx[0].label,
		label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`,
	});

	charts.daily = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: dates,
			datasets: [
				{
					label: 'Total Requests',
					data: dates.map(d => dailyData[d].total),
					backgroundColor: '#667eea',
					hoverBackgroundColor: '#5568d3',
					borderColor: '#5568d3',
					borderWidth: 1,
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
					backgroundColor: '#764ba2',
					hoverBackgroundColor: '#6a4292',
					borderColor: '#6a4292',
					borderWidth: 1,
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
		title: ctx => ctx[0].label,
		label: ctx => `Peak: ${ctx.parsed.x.toLocaleString()} requests`,
	});
	options.scales.x.title = {
		display: true,
		text: 'Number of Requests',
		color: 'rgba(255, 255, 255, 0.9)',
		font: {
			family: "'Cascadia Mono', 'Calibri', sans-serif",
			size: 13,
			weight: '600',
		},
	};

	charts.peakHours = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: sorted.map(([key]) => key),
			datasets: [{
				label: 'Requests',
				data: sorted.map(([, val]) => val),
				backgroundColor: '#ed64a6',
				hoverBackgroundColor: '#dc5395',
				borderColor: '#dc5395',
				borderWidth: 1,
				borderRadius: {
					topLeft: 6,
					topRight: 6,
					bottomLeft: 0,
					bottomRight: 0,
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

	const formatLabels = {
		hosts: '0.0.0.0',
		localhost: '127.0.0.1',
		adguard: 'AdGuard',
		dnsmasq: 'Dnsmasq',
		noip: 'No-IP',
		rpz: 'RPZ',
		unbound: 'Unbound',
	};

	const colors = [
		'#667eea',
		'#764ba2',
		'#ed64a6',
		'#ff9a9e',
		'#fad0c4',
		'#84fafc',
		'#00a8fc',
	];

	const labels = data.map(d => `${d.date} ${d.time}`);
	const datasets = Object.keys(formatLabels).map((key, idx) => ({
		label: formatLabels[key],
		data: data.map(d => d.categories?.[key] || 0),
		borderColor: colors[idx],
		backgroundColor: colors[idx] + '33',
		borderWidth: 2,
		fill: false,
		tension: 0.4,
		pointRadius: 0,
		pointBackgroundColor: colors[idx],
		pointBorderColor: colors[idx],
		pointHoverRadius: 6,
		pointHoverBackgroundColor: colors[idx],
		pointHoverBorderColor: '#fff',
		pointHoverBorderWidth: 2,
		pointBorderWidth: 1,
	}));

	const options = getCommonChartOptions();
	options.interaction = {
		mode: 'index',
		intersect: false,
	};
	options.plugins.legend.position = 'bottom';
	options.plugins.tooltip.callbacks = addUTCFooter({
		title: ctx => ctx[0].label,
		label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()} downloads`,
		afterBody: ctx => {
			const total = ctx.reduce((sum, item) => sum + item.parsed.y, 0);
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

const loadData = async () => {
	const from = document.getElementById('date-from').value;
	const to = document.getElementById('date-to').value;

	if (!from || !to) {
		alert('Please select both start and end dates');
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
	createFormatDistributionChart(data);
};

const loadQuickData = async days => {
	const to = new Date();
	const from = new Date(to);

	from.setDate(to.getDate() - days);

	const dateFrom = document.getElementById('date-from');
	const dateTo = document.getElementById('date-to');
	if (dateFrom) dateFrom.value = formatDate(from);
	if (dateTo) dateTo.value = formatDate(to);

	await loadData();
};

document.getElementById('load-data').addEventListener('click', loadData);

document.querySelectorAll('.btn-quick').forEach(btn => {
	btn.addEventListener('click', async e => {
		document.querySelectorAll('.btn-quick').forEach(b => b.classList.remove('active'));
		e.target.classList.add('active');

		const days = parseInt(e.target.dataset.days) || 7;
		await loadQuickData(days);
	});
});

document.querySelectorAll('.btn-interval').forEach(btn => {
	btn.addEventListener('click', async e => {
		document.querySelectorAll('.btn-interval').forEach(b => b.classList.remove('active'));
		e.target.classList.add('active');

		currentInterval = parseInt(e.target.dataset.interval) || 1;
		await loadData();
	});
});

setDefaultDates();
loadAllTimeStats();
loadQuickData(14);
