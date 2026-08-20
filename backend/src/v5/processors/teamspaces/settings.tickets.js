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

const { addTemplate, getAllTemplates, updateTemplate } = require('../../models/tickets.templates');
const { events } = require('../../services/eventsManager/eventsManager.constants');
const { getDefaultPinIconsDetails } = require('../../schemas/tickets/templates.constants');
const { publish } = require('../../services/eventsManager/eventsManager');
const { readFile } = require('fs/promises');
const { templates } = require('../../utils/responseCodes');

const TicketSettings = {};

TicketSettings.addTicketTemplate = addTemplate;
TicketSettings.updateTicketTemplate = async (teamspace, id, data) => {
	await updateTemplate(teamspace, id, data);
	publish(events.TICKET_TEMPLATE_UPDATED, { teamspace, template: id, data });
};
TicketSettings.getTemplateList = (teamspace) => getAllTemplates(
	teamspace, true, { _id: 1, name: 1, code: 1, deprecated: 1 },
);
TicketSettings.getPinIconNames = () => {
	const iconDetails = getDefaultPinIconsDetails();
	return Object.keys(iconDetails).sort();
};

TicketSettings.getPinIcon = (iconName, variant) => {
	const iconDetails = getDefaultPinIconsDetails();
	const iconPath = iconDetails[iconName]?.[variant];

	if (!iconPath) throw templates.pinIconNotFound;

	return readFile(iconPath);
};

module.exports = TicketSettings;
