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

module.exports = {
    server:  {
        http_port: 80
    },
    logfile: {
        filename: '3drepo.log'
    },
    db: {
        host: 'localhost',
        port: 27017
    },
    external: {
        x3domjs: 'http://x3dom.org/download/dev/x3dom.js',
        x3domcss : 'http://x3dom.org/download/dev/x3dom.css',
	repouicss : 'http://3drepo.io/css/ui.css'
    }
}

