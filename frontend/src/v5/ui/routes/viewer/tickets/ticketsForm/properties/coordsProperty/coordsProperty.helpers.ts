/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { hexToGLColor } from '@/v4/helpers/colors';
import { compact, get, isArray, isEmpty, isObject } from 'lodash';
import { IPinColorMapping, IPinSchema, ITemplate, ITicket } from '@/v5/store/tickets/tickets.types';
import { contrastColor } from 'contrast-color';
import { AdditionalProperties, TicketBaseKeys } from '../../../tickets.constants';
import { IPin } from '@/v4/services/viewer/viewer';
import { COLOR } from '@/v5/ui/themes/theme';
import { rgbToHex } from '@controls/inputs/colorPicker/colorPicker.helpers';

export const NEW_TICKET_ID = 'temporaryIdForNewTickets';
const DEFAULT_COLOR = COLOR.PRIMARY_MAIN;

const findByName = (array: any[], name: string) => array.find(({ name: n }) => n === name);

export const DEFAULT_PIN = `${TicketBaseKeys.PROPERTIES}.${AdditionalProperties.PIN}`;

export const hasDefaultPin = (ticket: ITicket) => !!get(ticket, [TicketBaseKeys.PROPERTIES, AdditionalProperties.PIN]);

const getPinSchema = (name: string, template: ITemplate): IPinSchema | boolean => {
	if (!template) return;
	if (name === DEFAULT_PIN) return template.config?.pin;
	const path = name.split('.');
	if (path[0] === TicketBaseKeys.PROPERTIES) return findByName(template.properties, path[1]);
	const module = findByName(template.modules, path[1]);
	if (!module) return;
	return findByName(module.properties, path[2]);
};

export const getLinkedValuePath = (name, template): string => {
	const pinSchema = getPinSchema(name, template);
	const property = get(pinSchema, 'color.property');
	if (!property) return '';
	const module = property.module ? `${TicketBaseKeys.MODULES}.${property.module}` : TicketBaseKeys.PROPERTIES;
	const linkedValueName = property.name;
	return `${module}.${linkedValueName}`;
};

const getColorFromMapping = (ticket: ITicket, pinMapping: IPinColorMapping) => {
	const { property: { module = TicketBaseKeys.PROPERTIES, name }, mapping } = pinMapping;
	// @ts-ignore
	const defaultColorHex = rgbToHex(mapping.find((option) => option.default)?.default) || DEFAULT_COLOR;
	if (!ticket) return defaultColorHex;
	const linkedValue = module === TicketBaseKeys.PROPERTIES ?
		get(ticket, [TicketBaseKeys.PROPERTIES, name]) : get(ticket, [TicketBaseKeys.MODULES, module, name]);
	// @ts-ignore
	const rgb = mapping.find(({ value }) => value === linkedValue)?.color;
	return rgb ? rgbToHex(rgb) : defaultColorHex;
};

export const getPinColorHex = (name: string, template: ITemplate, ticket: ITicket) => {
	const pinSchema = getPinSchema(name, template);
	if (typeof pinSchema === 'boolean') return DEFAULT_COLOR; // if default pin with no colouring set
	if (isArray(pinSchema?.color)) return rgbToHex(pinSchema.color); // a custom colour is set, no mapping
	if (isObject(pinSchema?.color)) return getColorFromMapping(ticket, pinSchema.color); // a custom colour is set with mapping
	return DEFAULT_COLOR; // if custom pin with no colouring set
};

export const isPinLight = (hex: string) => contrastColor({ bgColor: hex, threshold: 230 }) !== '#FFFFFF';

export const formatPin = (pinId, position, isSelected: boolean, color: string): IPin => ({
	id: pinId,
	position,
	isSelected,
	type: 'ticket',
	colour: hexToGLColor(color),
});

export const getTicketPins = (templates, ticket, ticketPinId) => {
	const pinArray = [];
	const selectedTemplate = templates?.find(({ _id }) => _id === ticket?.type);

	if (isEmpty(ticket) || !selectedTemplate) return [];

	const selectedTicketId = ticket?._id || NEW_TICKET_ID;

	const moduleToPins = (modulePath) => ({ name, type }) => {
		const pinPath = `${modulePath}.${name}`;
		if (type !== 'coords' || !get(ticket, pinPath)) return;
		const pinId = pinPath === DEFAULT_PIN ? selectedTicketId : `${selectedTicketId}.${pinPath}`;
		const color = getPinColorHex(pinPath, selectedTemplate, ticket);
		const isSelected = pinId === ticketPinId;
		return formatPin(pinId, get(ticket, pinPath), isSelected, color);
	};
	pinArray.push(...selectedTemplate.properties.map(moduleToPins(TicketBaseKeys.PROPERTIES)));
	selectedTemplate.modules.forEach((module) => {
		const moduleName = module.name || module.type;
		if (!ticket.modules[moduleName]) return;
		pinArray.push(...module.properties.map(moduleToPins(`${TicketBaseKeys.MODULES}.${moduleName}`)));
	});
	return compact(pinArray);
};
