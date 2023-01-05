/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { formatMessage } from '@/v5/services/intl';
import { FederationsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { isEmpty } from 'lodash';
import { getUrl } from '@/v5/services/api/default';
import SequencingIcon from '@assets/icons/outlined/sequence-outlined.svg';
import SafetibaseIcon from '@assets/icons/outlined/safetibase-outlined.svg';
import CustomModuleIcon from '@assets/icons/outlined/circle-outlined.svg';
import { addBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { useParams } from 'react-router-dom';
import { EditableTicket, ITemplate } from './tickets.types';

export const TITLE_INPUT_NAME = 'title';

export const modelIsFederation = (modelId: string) => (
	!!FederationsHooksSelectors.selectContainersByFederationId(modelId).length
);

export const getEditableProperties = (template) => {
	const propertyIsEditable = ({ readOnly }) => !readOnly;

	return {
		properties: (template.properties || []).filter(propertyIsEditable),
		modules: (template.modules || []).map((module) => ({
			...module,
			properties: module.properties.filter(propertyIsEditable),
		})),
	};
};

const templatePropertiesToTicketProperties = (properties = []) => (
	properties.reduce(
		(ticketProperties, prop) => ({
			...ticketProperties,
			[prop.name]: prop.default,
		}),
		{},
	)
);

export const getDefaultTicket = (template: ITemplate): EditableTicket => {
	const properties = templatePropertiesToTicketProperties(template.properties);
	const modules = (template.modules || []).reduce(
		(ticketModules, { name, type, properties: moduleProperties }) => ({
			...ticketModules,
			[name || type]: templatePropertiesToTicketProperties(moduleProperties),
		}),
		{},
	);
	return ({
		title: '',
		type: template._id,
		// props at root level other than title and type are skipped as they are not required
		properties,
		modules,
	});
};

const filterEmptyModuleValues = (module) => {
	const parsedModule = {};
	const NULLISH_VALUES = [null, undefined, ''];
	Object.entries(module)
		// skip nullish values that are not 0s or false
		.filter((entry) => !NULLISH_VALUES.includes(entry[1] as any))
		.forEach(([key, value]) => {
			if (Array.isArray(value)) {
				if (value.length === 0) return;
				// If value is an empty coords property ([undefined x 3]), it shall be removed
				if (value.length === 3 && !value.some((v) => !NULLISH_VALUES.includes(v))) return;
				// A this point, we are either dealing with a coords property that has
				// at least 1 value that is not undefined, or with a manyOf property.
				// Since the manyOf (array of) values should not hold falsy values,
				// we map all those values to 0s. So, if the property was indeed
				// a manyOf, nothing happens, but if the property was a coords,
				// we map all the non-numeric values to 0.
				parsedModule[key] = value.map((v) => v || 0);
			} else {
				parsedModule[key] = value;
			}
		});
	return parsedModule;
};

export const filterEmptyTicketValues = (ticket) => {
	const parsedTicket = {};
	Object.entries(ticket).forEach(([key, value]) => {
		switch (key) {
			case 'properties':
				parsedTicket[key] = filterEmptyModuleValues(value);
				break;
			case 'modules':
				parsedTicket[key] = {};
				Object.entries(value).forEach(([module, moduleValue]) => {
					const parsedModule = filterEmptyModuleValues(moduleValue);
					if (!isEmpty(parsedModule)) {
						parsedTicket[key][module] = parsedModule;
					}
				});
				break;
			default:
				parsedTicket[key] = value;
		}
	});
	return parsedTicket;
};

const moduleTypeProperties = {
	safetibase: { title: formatMessage({ id: 'customTicket.panel.safetibase', defaultMessage: 'Safetibase' }), Icon: SafetibaseIcon },
	sequencing: { title: formatMessage({ id: 'customTicket.panel.sequencing', defaultMessage: 'Sequencing' }), Icon: SequencingIcon },
	shapes: { title: formatMessage({ id: 'customTicket.panel.shapes', defaultMessage: 'Shapes' }), Icon: CustomModuleIcon },
};

export const getModulePanelTitle = (module) => {
	if (module.name) return { title: module.name, Icon: CustomModuleIcon };
	return moduleTypeProperties[module.type];
};

export const getTicketResourceUrl = (
	teamspace,
	project,
	containerOrFederation,
	ticketId,
	resource,
	isFederation,
) => {
	const modelType = isFederation ? 'federations' : 'containers';
	return getUrl(
		`teamspaces/${teamspace}/projects/${project}/${modelType}/${containerOrFederation}/tickets/${ticketId}/resources/${resource}`,
	);
};

export const isResourceId = (str) => {
	const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
	return regexExp.test(str);
};

export const getImgSrc = (imgData) => {
	const { teamspace, project, containerOrFederation } = useParams();
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();

	if (!imgData) return '';
	if (isResourceId(imgData)) {
		return getTicketResourceUrl(teamspace, project, containerOrFederation, ticketId, imgData, isFederation);
	}
	return addBase64Prefix(imgData);
};

export const sanitizeViewVals = (vals, template) => {
	if (vals.properties) {
		const props = vals.properties;
		const propsDefs: any[] = template.properties;

		Object.keys(props).forEach((key) => {
			const definition = propsDefs.find((def) => def.name === key);
			if (definition?.type === 'view') {
				if (props[key] && isResourceId(props[key].screenshot)) {
					delete props[key].screenshot;
				}
			}
		});
	}

	return vals;
};

export const templateAlreadyFetched = (template: ITemplate) => {
	const fetchedProperties = ['modules', 'properties', 'config'];
	return fetchedProperties.some((prop) => Object.keys(template).includes(prop));
};
