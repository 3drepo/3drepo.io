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

const eventConstants = require('./eventsManager.constants');
const eventLabel = require('../../utils/logger').labels.event;
const events = require('events');
const logger = require('../../utils/logger').logWithLabel(eventLabel);

const eventsEmitter = new events.EventEmitter();

const EventsManager = {};

EventsManager.publish = (eventName, message) => {
	if (eventConstants.events[eventName]) {
		logger.logDebug(`[${eventName}] : ${JSON.stringify(message)}`);
		eventsEmitter.emit(eventName, message);
	} else {
		throw new Error(`Trying to publish an unknown event: ${eventName}`);
	}
};

EventsManager.subscribe = (eventName, callback) => {
	if (eventConstants.events[eventName]) {
		eventsEmitter.on(eventName, callback);
	} else {
		throw new Error(`Trying to subscribe to an unknown event: ${eventName}`);
	}
};

// NOTE: this is only used in testing situation to reset the event listeners - not used in practice.
/* istanbul ignore next */
EventsManager.reset = () => {
	eventsEmitter.removeAllListeners();
};

module.exports = EventsManager;
