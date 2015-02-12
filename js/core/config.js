/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var config = require('app-config').config;

module.exports = config;

// TODO: Should do some checking of validity of config file here.
// TODO: Tidy up
// TODO: Generate vhost boolean, and add checks for port/hostnames etc. (Maybe default ports)

// Dynamic config based on static config variables

if ('ssl' in config) {
	module.exports.apiServer.port = config.apiServer.api_https_port ? config.apiServer.api_https_port : config.servers[0].https_port;
} else {
	module.exports.apiServer.port = config.apiServer.api_http_port ? config.apiServer.api_http_port : config.servers[0].http_port;
}

if (!config.apiServer.hostname)
{
	module.exports.apiServer.hostname = "api." + config.servers[0].hostname;
}

for(i in config.servers)
{
	if ('ssl' in config) {
		module.exports.servers[i].port = config.servers[i].https_port;
	} else {
		module.exports.servers[i].port = config.servers[i].http_port;
	}

	module.exports.servers[i].url = module.exports.servers[i].hostname + ':' + module.exports.servers[i].port;
}

module.exports.apiServer.url = module.exports.apiServer.hostname + ':' + module.exports.apiServer.port;

