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
import { compact, get, isArray, isEmpty, isObject } from 'lodash';
import { IPinColorMapping, PinConfig, ITemplate, ITicket, PinIcon } from '@/v5/store/tickets/tickets.types';
import { AdditionalProperties, TicketBaseKeys } from '../../../tickets.constants';
import { IPin, PinType } from '@/v4/services/viewer/viewer';
import { COLOR } from '@/v5/ui/themes/theme';
import { hexToGLColor, rgbToHex } from '@/v5/helpers/colors.helper';

export const NEW_TICKET_ID = 'temporaryIdForNewTickets';
const DEFAULT_COLOR = COLOR.PRIMARY_MAIN;

const findByName = (array: any[], name: string) => array.find(({ name: n, type: t }) => [n, t].includes(name));

export const DEFAULT_PIN = `${TicketBaseKeys.PROPERTIES}.${AdditionalProperties.PIN}`;

export const hasDefaultPin = (ticket: ITicket) => !!get(ticket, [TicketBaseKeys.PROPERTIES, AdditionalProperties.PIN]);

const getPinConfig = (pinPath: string, template: ITemplate): PinConfig | boolean => {
	if (!template) return;
	if (pinPath === DEFAULT_PIN) return template.config?.pin;
	const path = pinPath.split('.');
	if (path[0] === TicketBaseKeys.PROPERTIES) return findByName(template.properties, path[1]);
	const module = findByName(template.modules, path[1]);
	if (!module) return;
	return findByName(module.properties, path[2]);
};

export const getColorTriggerPropName = (pinPropName, template): string => {
	const pinConfig = getPinConfig(pinPropName, template);
	const property = get(pinConfig, 'color.property');
	if (!property) return '';
	const module = property.module ? `${TicketBaseKeys.MODULES}.${property.module}` : TicketBaseKeys.PROPERTIES;
	const triggerPropertyName = property.name;
	return `${module}.${triggerPropertyName}`;
};

const getColorFromMapping = (ticket: ITicket, pinMapping: IPinColorMapping) => {
	const { property: { module = TicketBaseKeys.PROPERTIES, name }, mapping } = pinMapping;
	// @ts-expect-error-error
	const defaultColorHex = rgbToHex(mapping.find((option) => option.default)?.default) || DEFAULT_COLOR;
	if (!ticket) return defaultColorHex;
	const linkedValue = module === TicketBaseKeys.PROPERTIES ?
		get(ticket, [TicketBaseKeys.PROPERTIES, name]) : get(ticket, [TicketBaseKeys.MODULES, module, name]);
	// @ts-expect-error-error
	const rgb = mapping.find(({ value }) => value === linkedValue)?.color;
	return rgb ? rgbToHex(rgb) : defaultColorHex;
};

export const getPinColorHexForProperty = (propertyName: string, template: ITemplate, ticket: ITicket) => {
	const pinConfig = getPinConfig(propertyName, template);
	if (typeof pinConfig === 'boolean') return DEFAULT_COLOR; // if default pin with no colouring set
	if (isArray(pinConfig?.color)) return rgbToHex(pinConfig.color); // a custom colour is set, no mapping
	if (isObject(pinConfig?.color)) return getColorFromMapping(ticket, pinConfig.color); // a custom colour is set with mapping
	return DEFAULT_COLOR; // if custom pin with no colouring set
};

export const getPinIconForProperty =  (propertyName: string, template: ITemplate): PinIcon => {
	const pinConfig = getPinConfig(propertyName, template);
	if (isObject(pinConfig) && pinConfig.icon) return pinConfig.icon;
	return 'DEFAULT';
};

export const getPinId = (propPath, ticketOrId?: ITicket | string) => {
	const id = (isObject(ticketOrId) ? ticketOrId._id : ticketOrId ) || NEW_TICKET_ID  ;
	return propPath === DEFAULT_PIN ? id : `${id}.${propPath}`;
};

// PinIcon is the pin type that comes from the backend
const pinIconToType = {
	'DEFAULT' : 'ticket',
	'ISSUE' : 'issue',
	'RISK' : 'risk',
	'MARKER' : 'bookmark',
};

export const toPin = (propName: string, template: ITemplate,  ticket: ITicket, isSelected = false, coordValue?: number[]): IPin => {
	const colour = hexToGLColor(getPinColorHexForProperty(propName, template, ticket));
	const icon = getPinIconForProperty(propName, template);
	const id = getPinId(propName, ticket);
	return {
		id, 
		position: (coordValue || get(ticket, propName) as number[]), 
		isSelected,
		type: pinIconToType[icon] as PinType,
		colour,
	};
};

export const pinTypeToPinIcon = (type: PinType) => (Object.keys(pinIconToType).find((key) => pinIconToType[key] === type) || 'DEFAULT') as PinIcon;

export const getTicketPins = (templates, ticket, ticketPinId) => {
	const pinArray = [];
	const selectedTemplate = templates?.find(({ _id }) => _id === ticket?.type);

	if (isEmpty(ticket) || !selectedTemplate) return [];

	const moduleToPins = (modulePath) => ({ name, type }) => {
		const pinPath = `${modulePath}.${name}`;
		if (type !== 'coords' || !get(ticket, pinPath)) return;
		const isSelected = getPinId(pinPath, ticket) === ticketPinId;
		return toPin(pinPath, selectedTemplate, ticket, isSelected);
	};

	pinArray.push(...selectedTemplate.properties.map(moduleToPins(TicketBaseKeys.PROPERTIES)));
	selectedTemplate.modules.forEach((module) => {
		const moduleName = module.name || module.type;
		if (!ticket.modules[moduleName]) return;
		pinArray.push(...module.properties.map(moduleToPins(`${TicketBaseKeys.MODULES}.${moduleName}`)));
	});
	return compact(pinArray);
};
