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

const { src } = require('../../../../../helper/path');

const { determineTestGroup } = require('../../../../../helper/utils');

const { createResponseCode, templates } = require(`${src}/utils/responseCodes`);
const TicketsSettings = require(`${src}/middleware/dataConverter/inputs/teamspaces/settings.tickets`);
const { generateRandomString } = require('../../../../../helper/services');

jest.mock('../../../../../../../src/v5/utils/responder');
const Responder = require(`${src}/utils/responder`);

const TicketTemplateConstants = require(`${src}/schemas/tickets/templates.constants`);

const testCheckPinIconExists = () => {
	const unknownPinIcon = generateRandomString();
	const unknownVariant = generateRandomString();
	const knownPinIcon = TicketTemplateConstants.DEFAULT_PIN_ICONS[0];
	const knownVariant = TicketTemplateConstants.PIN_ICON_VARIANTS[0];
	describe.each([
		['respond with INVALID_ARGUMENTS if the pin icon does not exist', false,
			{ pinIcon: unknownPinIcon, variant: knownVariant },
			createResponseCode(templates.invalidArguments, `Pin icon "${unknownPinIcon}" does not exist.`)],
		['respond with INVALID_ARGUMENTS if the pin icon variant is not valid', false,
			{ pinIcon: knownPinIcon, variant: unknownVariant },
			createResponseCode(templates.invalidArguments, `Pin icon variant "${unknownVariant}" does not exist.`)],
		['call next if the pin icon and variant are valid', true,
			{ pinIcon: knownPinIcon, variant: knownVariant }],
	])('Check pin icon exists', (desc, succeed, data, output) => {
		test(`Should ${succeed ? 'call next' : 'respond with error'} if ${desc}`, async () => {
			const fn = jest.fn();
			const req = { params: data };
			const res = {};

			await TicketsSettings.checkPinIconExists(req, res, fn);

			if (succeed) {
				expect(fn).toHaveBeenCalledTimes(1);
				expect(Responder.respond).not.toHaveBeenCalled();
			} else {
				expect(fn).not.toHaveBeenCalled();
				expect(Responder.respond).toHaveBeenCalledTimes(1);
				expect(Responder.respond).toHaveBeenCalledWith(req, res, output);
			}
		});
	});
};

describe(determineTestGroup(__filename), () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	testCheckPinIconExists();
});
