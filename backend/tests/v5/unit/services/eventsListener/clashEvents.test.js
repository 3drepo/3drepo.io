/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { determineTestGroup } = require('../../../helper/utils');
const { src } = require('../../../helper/path');

jest.mock('../../../../../src/v5/services/eventsManager/eventsManager');
const ClashEventsListener = require(`${src}/services/eventsListener/clashEvents`);
const EventsManager = require(`${src}/services/eventsManager/eventsManager`);
const { events } = require(`${src}/services/eventsManager/eventsManager.constants`);

const testClashRunProcessed = () => {
	describe('Clash Run Processed Event', () => {
		test(`Should subscribe to ${events.CLASH_RUN_PROCESSED}`, () => {
			ClashEventsListener.init();

			expect(EventsManager.subscribe).toHaveBeenCalledTimes(1);
			expect(EventsManager.subscribe).toHaveBeenCalledWith(events.CLASH_RUN_PROCESSED, expect.any(Function));
			expect(() => EventsManager.subscribe.mock.calls[0][1]()).not.toThrow();
		});
	});
};

describe(determineTestGroup(__filename), () => {
	testClashRunProcessed();
});
