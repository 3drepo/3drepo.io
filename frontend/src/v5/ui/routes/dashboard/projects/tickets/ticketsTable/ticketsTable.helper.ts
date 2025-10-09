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

import { BaseProperties, IssueProperties, SafetibaseProperties, SequencingProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { formatMessage } from '@/v5/services/intl';
import _ from 'lodash';
import { RiskLevels, TreatmentStatuses } from '@controls/chip/chip.types';

export type PresetValue = { key: string, value: string }; 
export type SetTicketValue =  (modelId?: string, ticket_id?: string, presValue?: PresetValue, replace?: boolean) => void;

export const NEW_TICKET_ID = 'new';

export const SAFETIBASE_PROPERTIES_GROUPS = {
	[SafetibaseProperties.LEVEL_OF_RISK]: RiskLevels,
	[SafetibaseProperties.TREATMENT_STATUS]: TreatmentStatuses,
};

const TICKET_PROPERTIES_LABEL = {
	id: formatMessage({ id: 'properties.label.id', defaultMessage: '#Id' }),
	modelName: formatMessage({ id: 'properties.label.federationContainer', defaultMessage: 'Federation / Container' }),
	[BaseProperties.TITLE]: formatMessage({ id: 'properties.label.title', defaultMessage: 'Title' }),
	[`properties.${BaseProperties.UPDATED_AT}`]: formatMessage({ id: 'properties.label.updatedAt', defaultMessage: 'Updated At' }),
	[`properties.${BaseProperties.DESCRIPTION}`]: formatMessage({ id: 'properties.label.description', defaultMessage: 'Description' }),
	[`properties.${BaseProperties.CREATED_AT}`]: formatMessage({ id: 'properties.label.createdAt', defaultMessage: 'Created At' }),
	[`properties.${BaseProperties.OWNER}`]: formatMessage({ id: 'properties.label.owner', defaultMessage: 'Owner' }),
	[`properties.${BaseProperties.STATUS}`]: formatMessage({ id: 'properties.label.status', defaultMessage: 'Status' }),
	[`properties.${IssueProperties.DUE_DATE}`]: formatMessage({ id: 'properties.label.dueDate', defaultMessage: 'Due Date' }),
	[`properties.${IssueProperties.PRIORITY}`]: formatMessage({ id: 'properties.label.priority', defaultMessage: 'Priority' }),
	[`properties.${IssueProperties.ASSIGNEES}`]: formatMessage({ id: 'properties.label.assignees', defaultMessage: 'Assignees' }),
	[`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`]: formatMessage({ id: 'modules.safetibase.label.levelOfRisk', defaultMessage: 'Safetibase : Level of Risk' }),
	[`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`]: formatMessage({ id: 'modules.safetibase.label.treatmentStatus', defaultMessage: 'Safetibase : Treatment Status' }),
	[`modules.safetibase.${SafetibaseProperties.TREATED_LEVEL_OF_RISK}`]: formatMessage({ id: 'modules.safetibase.label.treatedLevelOfRisk', defaultMessage: 'Safetibase : Treated Level of Risk' }),
	[`modules.sequencing.${SequencingProperties.START_TIME}`]: formatMessage({ id: 'modules.sequencing.label.startTime', defaultMessage: 'Sequencing : Start Time' }),
	[`modules.sequencing.${SequencingProperties.END_TIME}`]: formatMessage({ id: 'modules.sequencing.label.endTime', defaultMessage: 'Sequencing : End Time' }),
} as const;

export const stripModuleOrPropertyPrefix = (name) => name.replace(/^(properties|modules)\./, '');

export const hasRequiredViewerProperties = (template) => {
	const modules = template.modules?.flatMap((module) => module.properties) || [];
	const properties = modules.concat(template.properties || []);
	return properties.some(({ required, type }) => required && ['view', 'coords'].includes(type));
};

// These columns should always be included in the table when a template is selected
export const DEFAULT_COLUMNS = [
	'id',
	BaseProperties.TITLE,
	'modelName',
];

// These are the columns that are initially shown if no override exists in the template config
export const INITIAL_COLUMNS_NO_OVERRIDES = [
	...DEFAULT_COLUMNS,
	`properties.${BaseProperties.CREATED_AT}`,
	`properties.${IssueProperties.ASSIGNEES}`, 
	`properties.${BaseProperties.OWNER}`,
	`properties.${IssueProperties.DUE_DATE}`,
	`properties.${IssueProperties.PRIORITY}`,
	`properties.${BaseProperties.STATUS}`,
	`modules.safetibase.${SafetibaseProperties.LEVEL_OF_RISK}`,
	`modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`,
];

export const getPropertyLabel = (name) => {
	const defaultName = TICKET_PROPERTIES_LABEL[name];
	if (defaultName) return defaultName;
	
	return stripModuleOrPropertyPrefix(name)
		.split('.')
		.map(_.startCase)
		.join(' : ');
};