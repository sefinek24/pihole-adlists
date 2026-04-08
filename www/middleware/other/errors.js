exports.notFound = (req, res) => {
	res.status(404).render('errors/404.ejs');
};

exports.rateLimit = (req, res) => {
	res.status(429).render('errors/429.ejs');
};

exports.internalError = (err, req, res, next) => {
	if (err) console.error(err);
	res.status(500).render('errors/500.ejs');
};

exports.onTimeout = (req, res) => {
	res.status(503).render('errors/503.ejs');
};