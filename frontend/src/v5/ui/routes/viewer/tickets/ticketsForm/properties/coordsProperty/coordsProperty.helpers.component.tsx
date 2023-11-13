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
import { rgbaToHex } from '@/v4/helpers/colors';
import { get, isArray, isObject } from 'lodash';
import { theme } from '@/v5/ui/themes/theme';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { contrastColor } from 'contrast-color';
import { AdditionalProperties } from '../../../tickets.constants';

const DEFAULT_COLOR = theme.palette.primary.main;

const findByName = (array, name) => array.find(({ name: n }) => n === name);
const rgbArrayToHex = (obj) => rgbaToHex(obj?.toString());

const PROPERTIES = 'properties';
export const DEFAULT_PIN = `${PROPERTIES}.${AdditionalProperties.PIN}`;

type IGetPinSchema = {
	name: string;
	template: ITemplate;
};
const getPinSchema = ({ name, template }: IGetPinSchema) => {
	if (name === DEFAULT_PIN) return template.config?.pin; // Default Pin
	const path = name.split('.');
	if (path[0] === PROPERTIES) return findByName(template.properties, path[1]);
	const module = findByName(template.modules, path[1]);
	if (!module) return;
	return findByName(module.properties, path[2]);
};

const getColorFromMapping = (ticket, pinSchema) => {
	const { property: { module = PROPERTIES, name }, mapping } = pinSchema.color;
	const defaultColorHex = rgbArrayToHex(mapping.find((option) => option.default)?.default) || DEFAULT_COLOR;
	if (!ticket) return defaultColorHex;
	const linkedValue = module === PROPERTIES ? get(ticket.properties, name) : get(ticket?.modules, [module, name]);
	const rgb = mapping.find(({ value }) => value === linkedValue)?.color;
	return rgb ? rgbArrayToHex(rgb) : defaultColorHex;
};

export const getPinColorHex = (name: string, template, ticket ) => {
	const pinSchema = getPinSchema({ name, template  });

	if (isArray(pinSchema?.color)) return rgbArrayToHex(pinSchema.color);
	if (isObject(pinSchema?.color)) return getColorFromMapping(ticket, pinSchema);
	return DEFAULT_COLOR;
};

export const getTicketDefaultPinColor = (ticket, template) => {
	return isObject(template?.config?.pin) ? getColorFromMapping(ticket, template.config.pin) : DEFAULT_COLOR;
};

export const isPinLight = (hex: string) => contrastColor({ bgColor: hex, threshold: 230 }) !== '#FFFFFF';
