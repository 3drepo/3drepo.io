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

const { DEFAULT_PIN_ICONS, PIN_ICON_VARIANTS } = require('../../../../schemas/tickets/templates.constants');
const { createResponseCode, templates } = require('../../../../utils/responseCodes');
const { respond } = require('../../../../utils/responder');

const TicketsSettingsMiddleware = {};

TicketsSettingsMiddleware.checkPinIconExists = async (req, res, next) => {
	const { pinIcon, variant } = req.params;
	const pinIconNames = DEFAULT_PIN_ICONS;

	try {
		if (!pinIconNames.includes(pinIcon)) {
			throw createResponseCode(templates.invalidArguments, `Pin icon "${pinIcon}" does not exist.`);
		} else if (!PIN_ICON_VARIANTS.includes(variant)) {
			throw createResponseCode(templates.invalidArguments, `Pin icon variant "${variant}" does not exist.`);
		}

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

module.exports = TicketsSettingsMiddleware;
