/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const authEventsListener = require('./components/authEvents');
const modelEventsListener = require('./components/modelEvents');
const userEventsListener = require('./components/userEvents');

const EventsListener = {};

EventsListener.init = () => {
	modelEventsListener.init();
	authEventsListener.init();
	userEventsListener.init();
};

module.exports = EventsListener;
