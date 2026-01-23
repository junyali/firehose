// Not currently used

const { StatsD } = require('node-statsd');
const { env } = require('./utils/env');

const environment = 'production';
const graphite = env.GRAPHITE_HOST;

if (environment.toLowerCase() == 'production' && graphite == null) {
    throw new Error('Graphite is not working');
}

const options = {
    host: graphite,
    port: 8125,
    prefix: `${environment}.channelmodtools.`,
};

const metrics = new StatsD(options);

module.exports = { metrics };
