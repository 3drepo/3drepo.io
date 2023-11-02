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
import { useParams } from 'react-router-dom';
import { rgbaToHex } from '@/v4/helpers/colors';
import { TicketsCardHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { get, isArray, isObject } from 'lodash';
import { theme } from '@/v5/ui/themes/theme';
import { ITemplate } from '@/v5/store/tickets/tickets.types';

const DEFAULT_COLOR = theme.palette.primary.main;

const findByName = (array, name) => array.find(({ name: n }) => n === name);
const rgbArrayToHex = (obj) => rgbaToHex(obj?.toString());

type IGetPinSchema = {
	name: string;
	template: ITemplate;
};
const getPinSchema = ({ name, template }: IGetPinSchema) => {
	if (!template) return null;
	if (name === 'properties.Pin') return template.config.pin; // Default Pin
	const path = name.split('.');
	if (path[0] === 'properties') return findByName(template.properties, path[1]);
	const module = findByName(template.modules, path[1]);
	return findByName(module.properties, path[2]);
};

const getColorFromMapping = (ticket, pinSchema) => {
	const { property: { module = 'properties', name }, mapping } = pinSchema.color;
	const defaultColorHex = rgbArrayToHex(mapping.find((option) => option.default)?.default) || DEFAULT_COLOR;
	if (!ticket) return defaultColorHex;
	const linkedValue = module === 'properties' ? get(ticket.properties, name) : get(ticket?.modules, [module, name]);
	const rgb = mapping.find(({ value }) => value === linkedValue)?.color;
	return rgb ? rgbArrayToHex(rgb) : defaultColorHex;
};

export const getPinColorHex = (name: string) => {
	const { containerOrFederation } = useParams<ViewerParams>();
	if (!containerOrFederation) return DEFAULT_COLOR; // if in tabular view
	const ticket = TicketsCardHooksSelectors.selectSelectedTicket();
	const selectedTemplateId = TicketsCardHooksSelectors.selectSelectedTemplateId() ?? ticket?.type;
	const template = TicketsHooksSelectors.selectTemplateById(containerOrFederation, selectedTemplateId);
	
	const pinSchema = getPinSchema({ name, template });

	if (isArray(pinSchema?.color)) return rgbArrayToHex(pinSchema.color);
	if (isObject(pinSchema?.color)) return getColorFromMapping(ticket, pinSchema);
	return DEFAULT_COLOR;
};
