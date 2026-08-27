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

Responder.respond.mockImplementation((req, res, errCode) => errCode);

const testCheckPinIconExists = () => {
  const original = TicketTemplateConstants.getDefaultPinIconNames;
  describe('Check pin icon exists', () => {
    beforeEach(() => {
      TicketTemplateConstants.getDefaultPinIconNames = original;
    });
    const testCases = [
      ['the pin icon does not exist', false, { pinIcon: generateRandomString(), variant: 'normal' }, templates.invalidArguments],
      ['the pin icon variant is not valid', false, { pinIcon: 'DEFAULT', variant: generateRandomString() }, templates.invalidArguments],
      ['the pin icon and variant are valid', true, { pinIcon: 'DEFAULT', variant: 'normal' }, null],
    ];

    const runTests = (description, succeed, data, output) => {
    	test(`Should ${succeed ? 'call next' : `respond with ${output.code}`} if ${description}`, async () => {
    		const fn = jest.fn();
    		const req = { params: data };
    		const res = {};

    		TicketTemplateConstants.getDefaultPinIconNames = jest.fn().mockReturnValueOnce([data.pinIcon]);

    		await TicketsSettings.checkPinIconExists(req, res, fn);

    		if (succeed) {
    			expect(fn).toHaveBeenCalledTimes(1);
    			expect(Responder.respond).not.toHaveBeenCalled();
    		} else {
    			expect(fn).not.toHaveBeenCalled();
    			expect(Responder.respond).toHaveBeenCalledTimes(1);
    			expect(Responder.respond).toHaveBeenCalledWith(req, res, createResponseCode(output, `Pin icon "${data.pinIcon}" with variant "${data.variant}" not a valid combination.`));
    		}
    	});
    };

    describe.each(testCases)('', (description, succeed, data, output) => {
    	runTests(description, succeed, data, output);
    });
  });
};

describe(determineTestGroup(__filename), () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  testCheckPinIconExists();
});