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

const { src } = require('../../../helper/path');

const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

describe('services/eventsManager/eventsManager', () => {
	test('Should throw an error if the user tries to subscribe to an unknown event', () => {
		expect(() => EventsManager.subscribe('sdflkdsjflds', () => {})).toThrow();
	});

	test('Should throw an error if the user tries to publish an unknown event', () => {
		expect(() => EventsManager.publish('sddsfsdfds', {})).toThrow();
	});

	test('Should be able to subscribe to a known event', () => {
		const fn = jest.fn();
		EventsManager.subscribe(events.NEW_GROUPS, fn);

		EventsManager.publish(events.UPDATE_GROUP, { abc: 234 });

		expect(fn.mock.calls.length).toBe(0);

		const msg = { abc: 123 };
		EventsManager.publish(events.NEW_GROUPS, msg);

		expect(fn.mock.calls.length).toBe(1);
		expect(fn.mock.calls[0][0]).toEqual(msg);
	});
});
