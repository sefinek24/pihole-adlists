const morgan = require('morgan');

const UPTIME_BOT_UA = 'Better Uptime Bot Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36';
const skip = req => req.headers['user-agent'] === UPTIME_BOT_UA;

module.exports = morgan('[:status :method :response-time ms] :url :user-agent :remote-addr ":referrer"', { skip });