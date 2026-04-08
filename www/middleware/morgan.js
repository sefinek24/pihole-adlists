const morgan = require('morgan');

const skip = req => req.headers['user-agent']?.includes('Better Uptime Bot');

module.exports = morgan('[:status :method :response-time ms] :url :user-agent :remote-addr ":referrer"', { skip });