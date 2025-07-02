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
import { FederationsHooksSelectors, SequencesHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { camelCase, isEmpty, isEqual, isObject, mapKeys, last, set } from 'lodash';
import { getUrl } from '@/v5/services/api/default';
import ClashIcon from '@assets/icons/outlined/clash-outlined.svg';
import SequencingIcon from '@assets/icons/outlined/sequence-outlined.svg';
import SafetibaseIcon from '@assets/icons/outlined/safetibase-outlined.svg';
import ShapesIcon from '@assets/icons/outlined/shapes-outlined.svg';
import CustomModuleIcon from '@assets/icons/outlined/circle-outlined.svg';
import { addBase64Prefix, stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { useParams } from 'react-router-dom';
import { TicketBaseKeys, SequencingProperties, BaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { EditableTicket, Group, GroupOverride, ITemplate, ITicket, Viewpoint } from './tickets.types';
import { getSanitizedSmartGroup } from './ticketsGroups.helpers';
import { useContext } from 'react';
import { TicketContext } from '@/v5/ui/routes/viewer/tickets/ticket.context';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';

export const modelIsFederation = (modelId: string) => !!FederationsHooksSelectors.selectFederationById(modelId);

export const getEditableProperties = (template) => {
	const propertyIsEditable = ({ readOnly }) => !readOnly;

	// Doesnt return the config or anything else; this is used in the new ticket form in order to not show the comments.
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
			[prop.name]: prop.default ?? (prop.type === 'manyOf' ? [] : ''),
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
	) as any;

	const currentSequenceDateTime = SequencesHooksSelectors.selectSelectedDate();
	if (modules.sequencing && currentSequenceDateTime) {
		modules.sequencing[SequencingProperties.START_TIME] = new Date(currentSequenceDateTime).getTime();
	}

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
			case TicketBaseKeys.PROPERTIES:
				parsedTicket[key] = filterEmptyModuleValues(value);
				break;
			case TicketBaseKeys.MODULES:
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
	clash: { title: formatMessage({ id: 'customTicket.panel.clash', defaultMessage: 'Clash' }), Icon: ClashIcon },
	safetibase: { title: formatMessage({ id: 'customTicket.panel.safetibase', defaultMessage: 'Safetibase' }), Icon: SafetibaseIcon },
	sequencing: { title: formatMessage({ id: 'customTicket.panel.sequencing', defaultMessage: 'Sequencing' }), Icon: SequencingIcon },
	shapes: { title: formatMessage({ id: 'customTicket.panel.shapes', defaultMessage: 'Shapes' }), Icon: ShapesIcon },
};

export const getModulePanelProps = (module) => {
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

export const getImgSrcContext = () => {
	const { teamspace, project } = useParams<ViewerParams>();
	const { containerOrFederation } = useContext(TicketContext);
	const isFederation = modelIsFederation(containerOrFederation);
	const ticketId = TicketsCardHooksSelectors.selectSelectedTicketId();

	return { teamspace, project, containerOrFederation, ticketId, isFederation };
};

export const getImgSrc = (imgData, context = getImgSrcContext()) => {
	const { teamspace, project, containerOrFederation, ticketId, isFederation } = context;
	if (!imgData) return '';
	if (isResourceId(imgData)) {
		return getTicketResourceUrl(teamspace, project, containerOrFederation, ticketId, imgData, isFederation);
	}
	return addBase64Prefix(imgData);
};

export const isUrlResource = (str) => str.startsWith(getUrl(''));

export const getImgIdFromSrc = (imgSrc) => {
	if (!imgSrc) return '';
	if (isUrlResource(imgSrc)) return last(imgSrc.split('/'));
	return stripBase64Prefix(imgSrc);
};

const overrideHasEditedGroup = (override: GroupOverride, oldOverrides: GroupOverride[]) => {
	const overrideId = (override.group as Group)._id;
	if (!overrideId) return false;

	const oldGroup = oldOverrides.find(({ group }) => (group as Group)._id === overrideId)?.group;
	return !isEqual(oldGroup, override.group);
};

const findOverrideWithEditedGroup = (values, oldValues, propertiesDefinitions) => {
	if (!values) return null;

	let overrideWithEditedGroup;
	Object.keys(values).forEach((key) => {
		const definition = propertiesDefinitions.find((def) => def.name === key);
		if (definition?.type === 'view') {
			const viewValue: Viewpoint | undefined = values[key];
			const oldValue: Viewpoint | undefined = oldValues?.[key];

			overrideWithEditedGroup ||= viewValue?.state?.colored?.find((o) => overrideHasEditedGroup(o, oldValue?.state?.colored || []))
				|| viewValue?.state?.hidden?.find((o) => overrideHasEditedGroup(o, oldValue?.state?.hidden || []));
		}
	});

	return overrideWithEditedGroup;
};

export const findEditedGroup = (values: Partial<ITicket>, ticket: ITicket, template) => {
	let overrideWithEditedGroup;
	if (values.properties) {
		overrideWithEditedGroup = findOverrideWithEditedGroup(values.properties, ticket.properties, template.properties);
	}

	if (values.modules) {
		template?.modules?.forEach(({ type, name, properties }) => {
			const module = type || name;
			overrideWithEditedGroup ||= findOverrideWithEditedGroup(values.modules[module], ticket.modules[module], properties);
		});
	}

	return overrideWithEditedGroup?.group;
};

const getSanitizedOverride = ({ group, ...rest }: GroupOverride) => ({ ...rest, group: getSanitizedSmartGroup((group as Group)?._id || group) });

const sanitizeViewValues = (values, oldValues, propertiesDefinitions) => {
	if (!values) return;

	Object.keys(values).forEach((key) => {
		const definition = propertiesDefinitions.find((def) => def.name === key);
		if (definition?.type === 'view') {
			const viewValue:Viewpoint | undefined = values[key];
			const oldValue:Viewpoint | undefined = oldValues?.[key];

			if (!viewValue) return;

			if (isResourceId(viewValue?.screenshot)) {
				delete viewValue.screenshot;
			}

			if (!viewValue.camera && oldValue?.camera) {
				viewValue.camera = null;
				viewValue.clippingPlanes = null;
			}

			if (!viewValue.state && oldValue?.state) {
				viewValue.state = null;
			}

			if (viewValue.state?.colored) {
				viewValue.state.colored = viewValue.state.colored.map(getSanitizedOverride);
			}

			if (viewValue.state?.hidden) {
				viewValue.state.hidden = viewValue.state.hidden.map(getSanitizedOverride);
			}
		}
	});
};

export const sanitizeViewVals = (values:Partial<ITicket>, ticket:ITicket, template) => {
	if (values.properties) {
		sanitizeViewValues(values.properties, ticket.properties, template.properties);
	}

	if (values.modules) {
		template.modules.forEach(((module) => {
			sanitizeViewValues(values.modules[module.name], ticket.modules[module.name], module.properties);
		}));
	}
};

export const templateAlreadyFetched = (template: ITemplate) => {
	const fetchedProperties: string[] = Object.values(TicketBaseKeys);
	return fetchedProperties.some((prop) => Object.keys(template).includes(prop));
};

export const getPropertiesInCamelCase = (properties) => mapKeys(properties, (_, key) => camelCase(key));

const fillEmptyOverrides = (values: Partial<ITicket>) => {
	Object.values(values).forEach((value) => {
		if (isObject(value) && 'state' in value) {
			const viewValue: Viewpoint | undefined = value;

			viewValue.state ||= {} as any;
			viewValue.state.colored ||= [];
			viewValue.state.hidden ||= [];
			viewValue.state.transformed ||= [];
		}
	});
};

export const fillOverridesIfEmpty = (values: Partial<ITicket>) => {
	if (values.properties) {
		fillEmptyOverrides(values.properties);
	}

	if (values.modules) {
		Object.values(values.modules).forEach(fillEmptyOverrides);
	}
};

export const addUpdatedAtTime = (ticket) => set(ticket, `properties.${BaseProperties.UPDATED_AT}`, +new Date());

export const removeDeprecated = (template: ITemplate): ITemplate => {
	if (!template) return null;
	const removeDeprecatedItems = (properties: any[])  => properties.filter((prop) => !prop.deprecated);

	return {
		...template,
		properties: removeDeprecatedItems(template.properties ?? []),
		modules: removeDeprecatedItems(template.modules ?? [])
			.map((module) => (
				{
					...module, 
					properties: removeDeprecatedItems(module.properties ?? []),
				}
			)),
	};
};
