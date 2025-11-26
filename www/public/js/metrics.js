const charts = {};

const showLoading = () => document.getElementById('loading').style.display = 'flex';
const hideLoading = () => document.getElementById('loading').style.display = 'none';

const formatDate = date => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const loadAllTimeStats = async () => {
	try {
		const response = await fetch('/api/stats/alltime');
		if (!response.ok) throw new Error('Failed to fetch all-time stats');

		const data = await response.json();
		const stats = data.data;

		document.getElementById('alltime-total').textContent = (stats.total || 0).toLocaleString();
		document.getElementById('alltime-blocklists').textContent = (stats.blocklists || 0).toLocaleString();

		const categories = stats.categories || {};
		const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
		document.getElementById('alltime-top-category').textContent = topCategory
			? `${topCategory[0]}`
			: 'N/A';

		const startDate = new Date('2024-10-28');
		const today = new Date();
		const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
		const avgPerDay = daysSinceStart > 0 ? Math.floor(stats.total / daysSinceStart) : 0;
		document.getElementById('alltime-avg').textContent = avgPerDay.toLocaleString();

		document.getElementById('alltime-days').textContent = daysSinceStart;

		const responses = stats.responses || {};
		const successCodes = ['200', '201', '204', '304'];
		const successCount = successCodes.reduce((sum, code) => sum + (responses[code] || 0), 0);
		const successRate = stats.total > 0 ? ((successCount / stats.total) * 100).toFixed(2) : 0;
		document.getElementById('alltime-success-rate').textContent = `${successRate}%`;
	} catch (err) {
		console.error('Error loading all-time stats:', err);
	}
};

const setDefaultDates = () => {
	const today = new Date();
	const monthAgo = new Date(today);
	monthAgo.setDate(today.getDate() - 30);

	document.getElementById('date-from').value = formatDate(monthAgo);
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
	let peakMinute = { time: null, count: 0 };

	data.forEach(item => {
		totalRequests += item.total || 0;
		totalBlocklists += item.blocklists || 0;
		uniqueDates.add(item.date);

		if (item.total > peakMinute.count) {
			peakMinute = { time: `${item.date} ${item.time}`, count: item.total };
		}

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

	const successCodes = ['200', '201', '204', '304'];
	const errorCodes = ['400', '401', '403', '404', '429', '500', '502', '503', '504'];
	const successCount = successCodes.reduce((sum, code) => sum + (responses[code] || 0), 0);
	const errorCount = errorCodes.reduce((sum, code) => sum + (responses[code] || 0), 0);
	const successRate = totalRequests > 0 ? ((successCount / totalRequests) * 100).toFixed(2) : 0;
	const errorRate = totalRequests > 0 ? ((errorCount / totalRequests) * 100).toFixed(2) : 0;

	const totalMinutes = data.length;
	const totalHours = totalMinutes / 60;
	const avgPerHour = totalHours > 0 ? Math.floor(totalRequests / totalHours) : 0;

	const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

	return {
		totalRequests,
		totalBlocklists,
		successRate,
		errorRate,
		peakMinute,
		responses,
		categories,
		hourlyData,
		avgPerHour,
		uniqueDays: uniqueDates.size,
		topCategory: topCategory ? topCategory[0] : 'N/A',
	};
};

const updateSummary = aggregated => {
	document.getElementById('total-requests').textContent = aggregated.totalRequests.toLocaleString();
	document.getElementById('blocklist-requests').textContent = aggregated.totalBlocklists.toLocaleString();
	document.getElementById('success-rate').textContent = `${aggregated.successRate}%`;
	document.getElementById('error-rate').textContent = `${aggregated.errorRate}%`;
	document.getElementById('avg-per-hour').textContent = aggregated.avgPerHour.toLocaleString();
	document.getElementById('unique-days').textContent = aggregated.uniqueDays;
	document.getElementById('period-top-category').textContent = aggregated.topCategory.toUpperCase();

	const peakTimeEl = document.getElementById('peak-time');
	if (aggregated.peakMinute.time) {
		peakTimeEl.textContent = `${aggregated.peakMinute.time} (${aggregated.peakMinute.count.toLocaleString()} requests)`;
	} else {
		peakTimeEl.textContent = 'N/A';
	}
};

const createRequestsChart = data => {
	const ctx = document.getElementById('requests-chart').getContext('2d');

	if (charts.requests) charts.requests.destroy();

	const labels = data.map(d => `${d.date} ${d.time}`);
	const totalData = data.map(d => d.total || 0);
	const blocklistData = data.map(d => d.blocklists || 0);

	charts.requests = new Chart(ctx, {
		type: 'line',
		data: {
			labels,
			datasets: [
				{
					label: 'Total Requests',
					data: totalData,
					borderColor: 'rgba(102, 126, 234, 1)',
					backgroundColor: 'rgba(102, 126, 234, 0.1)',
					fill: true,
					tension: 0.4,
				},
				{
					label: 'Blocklist Requests',
					data: blocklistData,
					borderColor: 'rgba(118, 75, 162, 1)',
					backgroundColor: 'rgba(118, 75, 162, 0.1)',
					fill: true,
					tension: 0.4,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: { labels: { color: '#fff' } },
			},
			scales: {
				x: {
					ticks: {
						color: '#fff',
						maxTicksLimit: 20,
						autoSkip: true,
					},
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
				},
				y: {
					ticks: { color: '#fff' },
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
				},
			},
		},
	});
};

const createResponsesChart = responses => {
	const ctx = document.getElementById('responses-chart').getContext('2d');

	if (charts.responses) charts.responses.destroy();

	const labels = Object.keys(responses);
	const data = Object.values(responses);

	const colors = [
		'rgba(102, 126, 234, 0.8)',
		'rgba(118, 75, 162, 0.8)',
		'rgba(237, 100, 166, 0.8)',
		'rgba(255, 154, 158, 0.8)',
		'rgba(250, 208, 196, 0.8)',
	];

	charts.responses = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels,
			datasets: [
				{
					data,
					backgroundColor: colors,
					borderWidth: 2,
					borderColor: '#fff',
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: { labels: { color: '#fff' } },
			},
		},
	});
};

const createCategoriesChart = categories => {
	const ctx = document.getElementById('categories-chart').getContext('2d');

	if (charts.categories) charts.categories.destroy();

	const labels = Object.keys(categories);
	const data = Object.values(categories);

	charts.categories = new Chart(ctx, {
		type: 'bar',
		data: {
			labels,
			datasets: [
				{
					label: 'Downloads',
					data,
					backgroundColor: 'rgba(102, 126, 234, 0.8)',
					borderColor: 'rgba(102, 126, 234, 1)',
					borderWidth: 2,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: { display: false },
				tooltip: {
					callbacks: {
						title: ctx => ctx[0].label,
						label: ctx => `${ctx.parsed.y.toLocaleString()} downloads`,
					},
				},
			},
			scales: {
				x: {
					ticks: { color: '#fff' },
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
					title: {
						display: true,
						text: 'Format',
						color: '#fff',
					},
				},
				y: {
					ticks: { color: '#fff' },
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
				},
			},
		},
	});
};

const createHourlyChart = (hourlyData, dateRange) => {
	const ctx = document.getElementById('hourly-chart').getContext('2d');

	if (charts.hourly) charts.hourly.destroy();

	const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
	const data = hours.map(h => hourlyData[h] || 0);

	charts.hourly = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: hours.map(h => `${h}:00`),
			datasets: [
				{
					label: 'Requests',
					data,
					backgroundColor: 'rgba(118, 75, 162, 0.8)',
					borderColor: 'rgba(118, 75, 162, 1)',
					borderWidth: 2,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: { display: false },
				tooltip: {
					callbacks: {
						title: ctx => `${ctx[0].label}`,
						label: ctx => `${ctx.parsed.y.toLocaleString()} requests`,
						afterLabel: () => `Date range: ${dateRange.from} to ${dateRange.to}`,
					},
				},
			},
			scales: {
				x: {
					ticks: { color: '#fff' },
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
					title: {
						display: true,
						text: 'Hour of Day',
						color: '#fff',
					},
				},
				y: {
					ticks: { color: '#fff' },
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
				},
			},
		},
	});
};

const createDailyChart = data => {
	const ctx = document.getElementById('daily-chart').getContext('2d');

	if (charts.daily) charts.daily.destroy();

	// Aggregate by date
	const dailyData = {};
	data.forEach(item => {
		const date = item.date;
		if (!dailyData[date]) {
			dailyData[date] = { total: 0, blocklists: 0 };
		}
		dailyData[date].total += item.total || 0;
		dailyData[date].blocklists += item.blocklists || 0;
	});

	const dates = Object.keys(dailyData).sort();
	const totals = dates.map(d => dailyData[d].total);
	const blocklists = dates.map(d => dailyData[d].blocklists);

	charts.daily = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: dates,
			datasets: [
				{
					label: 'Total Requests',
					data: totals,
					backgroundColor: 'rgba(102, 126, 234, 0.8)',
					borderColor: 'rgba(102, 126, 234, 1)',
					borderWidth: 2,
				},
				{
					label: 'Blocklist Downloads',
					data: blocklists,
					backgroundColor: 'rgba(118, 75, 162, 0.8)',
					borderColor: 'rgba(118, 75, 162, 1)',
					borderWidth: 2,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			plugins: {
				legend: { labels: { color: '#fff' } },
				tooltip: {
					callbacks: {
						title: ctx => ctx[0].label,
						label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString()}`,
					},
				},
			},
			scales: {
				x: {
					ticks: { color: '#fff' },
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
				},
				y: {
					ticks: { color: '#fff' },
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
				},
			},
		},
	});
};

const createPeakHoursChart = data => {
	const ctx = document.getElementById('peak-hours-chart').getContext('2d');

	if (charts.peakHours) charts.peakHours.destroy();

	// Aggregate by hour (date + hour)
	const hourlyData = {};
	data.forEach(item => {
		const hour = item.time.split(':')[0];
		const key = `${item.date} ${hour}:00`;
		hourlyData[key] = (hourlyData[key] || 0) + (item.total || 0);
	});

	// Sort and get top 10
	const sorted = Object.entries(hourlyData)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 10);

	const labels = sorted.map(([key]) => key);
	const values = sorted.map(([, val]) => val);

	charts.peakHours = new Chart(ctx, {
		type: 'bar',
		data: {
			labels,
			datasets: [
				{
					label: 'Requests',
					data: values,
					backgroundColor: 'rgba(237, 100, 166, 0.8)',
					borderColor: 'rgba(237, 100, 166, 1)',
					borderWidth: 2,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: true,
			indexAxis: 'y',
			plugins: {
				legend: { display: false },
				tooltip: {
					callbacks: {
						title: ctx => ctx[0].label,
						label: ctx => `${ctx.parsed.x.toLocaleString()} requests`,
					},
				},
			},
			scales: {
				x: {
					ticks: { color: '#fff' },
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
					title: {
						display: true,
						text: 'Requests',
						color: '#fff',
					},
				},
				y: {
					ticks: { color: '#fff' },
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
				},
			},
		},
	});
};

const createFormatDistributionChart = data => {
	const ctx = document.getElementById('format-distribution-chart').getContext('2d');

	if (charts.formatDist) charts.formatDist.destroy();

	const formatLabels = {
		hosts: '0.0.0.0',
		localhost: '127.0.0.1',
		adguard: 'AdGuard',
		dnsmasq: 'Dnsmasq',
		noip: 'No-IP',
		rpz: 'RPZ',
		unbound: 'Unbound',
	};

	const formatKeys = Object.keys(formatLabels);
	const colors = [
		'rgba(102, 126, 234, 1)',
		'rgba(118, 75, 162, 1)',
		'rgba(237, 100, 166, 1)',
		'rgba(255, 154, 158, 1)',
		'rgba(250, 208, 196, 1)',
		'rgba(132, 250, 252, 1)',
		'rgba(0, 168, 252, 1)',
	];

	const labels = data.map(d => `${d.date} ${d.time}`);
	const datasets = formatKeys.map((key, idx) => ({
		label: formatLabels[key],
		data: data.map(d => d.categories?.[key] || 0),
		borderColor: colors[idx],
		backgroundColor: colors[idx].replace('1)', '0.1)'),
		fill: false,
		tension: 0.4,
		pointRadius: 0,
		pointHoverRadius: 4,
	}));

	charts.formatDist = new Chart(ctx, {
		type: 'line',
		data: { labels, datasets },
		options: {
			responsive: true,
			maintainAspectRatio: true,
			interaction: {
				mode: 'index',
				intersect: false,
			},
			plugins: {
				legend: {
					labels: { color: '#fff' },
					position: 'bottom',
				},
			},
			scales: {
				x: {
					ticks: {
						color: '#fff',
						maxTicksLimit: 20,
						autoSkip: true,
					},
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
				},
				y: {
					ticks: { color: '#fff' },
					grid: { color: 'rgba(255, 255, 255, 0.1)' },
				},
			},
		},
	});
};

const loadData = async () => {
	const from = document.getElementById('date-from').value;
	const to = document.getElementById('date-to').value;

	if (!from || !to) {
		alert('Please select both start and end dates');
		return;
	}

	const data = await fetchMetrics(from, to);
	if (!data.length) {
		alert('No data available for selected date range');
		return;
	}

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

const loadQuickData = async hours => {
	const to = new Date();
	const from = new Date(to);

	if (hours) {
		from.setHours(to.getHours() - hours);
	} else {
		from.setDate(to.getDate() - 30);
	}

	document.getElementById('date-from').value = formatDate(from);
	document.getElementById('date-to').value = formatDate(to);

	await loadData();
};

document.getElementById('load-data').addEventListener('click', loadData);

document.querySelectorAll('.btn-quick').forEach(btn => {
	btn.addEventListener('click', async e => {
		document.querySelectorAll('.btn-quick').forEach(b => b.classList.remove('active'));
		e.target.classList.add('active');

		const hours = e.target.dataset.hours ? parseInt(e.target.dataset.hours) : null;
		await loadQuickData(hours);
	});
});

setDefaultDates();
loadAllTimeStats();
loadData();
