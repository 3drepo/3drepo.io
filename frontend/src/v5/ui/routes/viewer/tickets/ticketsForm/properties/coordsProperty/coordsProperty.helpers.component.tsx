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
import { get, isArray, isObject } from 'lodash';
import { IPinColorMapping, IPinSchema, ITemplate, ITicket } from '@/v5/store/tickets/tickets.types';
import { contrastColor } from 'contrast-color';
import { AdditionalProperties } from '../../../tickets.constants';
import { IPin } from '@/v4/services/viewer/viewer';
import { COLOR } from '@/v5/ui/themes/theme';
import { rgbToHex } from '@controls/inputs/colorPicker/colorPicker.helpers';

const DEFAULT_COLOR = COLOR.PRIMARY_MAIN;

const findByName = (array: any[], name: string) => array.find(({ name: n }) => n === name);

const PROPERTIES = 'properties';
export const DEFAULT_PIN = `${PROPERTIES}.${AdditionalProperties.PIN}`;

const getPinSchema = (name: string, template: ITemplate): IPinSchema | boolean => {
	if (!template) return;
	if (name === DEFAULT_PIN) return template.config?.pin; // Default Pin
	const path = name.split('.');
	if (path[0] === PROPERTIES) return findByName(template.properties, path[1]);
	const module = findByName(template.modules, path[1]);
	if (!module) return;
	return findByName(module.properties, path[2]);
};

const getColorFromMapping = (ticket: ITicket, pinMapping: IPinColorMapping) => {
	const { property: { module = PROPERTIES, name }, mapping } = pinMapping;
	// @ts-ignore
	const defaultColorHex = rgbToHex(mapping.find((option) => option.default)?.default) || DEFAULT_COLOR;
	if (!ticket) return defaultColorHex;
	const linkedValue = module === PROPERTIES ? get(ticket, [PROPERTIES, name]) : get(ticket, ['modules', module, name]);
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

export const ticketToPin = (ticket: ITicket, selectedId: string, color: string): IPin => ({
	id: ticket._id,
	position: ticket.properties.Pin,
	isSelected: ticket._id === selectedId,
	type: 'ticket',
	colour: hexToGLColor(color),
});
