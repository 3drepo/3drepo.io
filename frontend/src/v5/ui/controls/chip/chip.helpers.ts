/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { DEFAULT_STATUS_CONFIG, STATUS_TYPE_MAP, TicketStatusTypes, TreatmentStatuses } from './chip.types';
import { useParams } from 'react-router-dom';
import { StatusChipProps } from './statusChip/statusChip.component';
import { DashboardTicketsParams } from '../../routes/routes.constants';
import { BaseProperties, SafetibaseProperties } from '../../routes/viewer/tickets/tickets.constants';
import { get } from 'lodash';
import { ITicket } from '@/v5/store/tickets/tickets.types';

export const getStatusChipProps = ({ templateId, value, modelId }: StatusChipProps ) => {
	const { containerOrFederation = modelId } = useParams();
	const statusConfig = TicketsHooksSelectors.selectStatusConfigByTemplateId(containerOrFederation, templateId);
	const valueProps = statusConfig.values.find(({ name }) => name === value);
	if (!valueProps) return {};
	const { type, label = value } = valueProps;
	return { label, value, ...STATUS_TYPE_MAP[type] };
};

export const getStatusPropertyValues = (templateId) => {
	const { containerOrFederation, template = templateId } = useParams<DashboardTicketsParams>();
	const values = TicketsHooksSelectors.selectStatusConfigByTemplateId(containerOrFederation, template)?.values;
	return values.reduce((acc, { name }) => {
		acc[name] = getStatusChipProps({ templateId: template, value: name });
		return acc;
	}, {});
};

export const getStatusLabels = (containerOrFederation, templateId) => {
	const values = TicketsHooksSelectors.selectStatusConfigByTemplateId(containerOrFederation, templateId)?.values;
	return values.map(({ name, label }) => label || name);
};

export const ticketIsCompleted = (ticket: ITicket, template) => {
	const statusValue = get(ticket, `properties.${BaseProperties.STATUS}`);
	const allStatusValues = (template.config?.status || DEFAULT_STATUS_CONFIG).values;
	const statusType = allStatusValues.find(({ name }) => name === statusValue)?.type;
	const treatmentStatus = get(ticket, `modules.safetibase.${SafetibaseProperties.TREATMENT_STATUS}`);

	const isCompletedIssueProperty = [TicketStatusTypes.DONE, TicketStatusTypes.VOID].includes(statusType);
	const isCompletedTreatmentStatus = [TreatmentStatuses.AGREED_FULLY, TreatmentStatuses.VOID].includes(treatmentStatus);

	return (isCompletedIssueProperty || isCompletedTreatmentStatus);
};