exports.notFound = (req, res) => {
	res.status(404).render('errors/404.ejs');
};

exports.rateLimit = (req, res) => {
	res.status(429).render('errors/429.ejs');
};

exports.internalError = (err, req, res, next) => {
	res.status(500).render('errors/500.ejs');

	if (err) console.error(err);
};

exports.onTimeout = (req, res) => {
	res.status(503).render('errors/503.ejs');
};