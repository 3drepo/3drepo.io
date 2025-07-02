/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TicketsCardActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { enableRealtimeTickets } from '@/v5/services/realtime/ticketCard.events';
import { FederationsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { ITemplate, StatusValue } from '@/v5/store/tickets/tickets.types';
import { CardFilter } from '../../../components/viewer/cards/cardFilters/cardFilters.types';
import { TicketStatusTypes, TreatmentStatuses } from '@controls/chip/chip.types';
import { selectStatusConfigByTemplateId } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';
import { Transformers, useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { uniq } from 'lodash';

const TICKET_CODE_REGEX = /^[a-zA-Z]{3}:\d+$/;

const getTicketFiltersFromCodes = (values): CardFilter[] => [{
	module: '',
	property: 'Ticket ID',
	type: 'ticketCode',
	filter: {
		operator: 'is',
		values,
	},
}];

const getNonCompletedTicketFiltersByStatus = (templates: ITemplate[]): CardFilter => {
	const isCompletedValue = ({ type }: StatusValue) =>
		[TicketStatusTypes.DONE, TicketStatusTypes.VOID].includes(type);
	const getValuesByTemplate = ({ _id }) => selectStatusConfigByTemplateId(getState(), _id).values;

	const completedValues = templates
		.flatMap(getValuesByTemplate)
		.filter(isCompletedValue)
		.map((v) => v.name);

	return {
		module: '',
		property: 'Status',
		type: 'status',
		filter: {
			operator: 'nis',
			values: uniq(completedValues),
		},
	};
};

const getNonCompletedTicketFiltersBySafetibase = (): CardFilter => ({
	module: 'safetibase',
	property: 'Treatment Status',
	type: 'oneOf',
	filter: {
		operator: 'nis',
		values: [
			TreatmentStatuses.REJECTED,
			TreatmentStatuses.VOID,
		],
	},
});

const getNonCompletedTicketFilters = (templates: ITemplate[]): CardFilter[] => {
	const filters = [getNonCompletedTicketFiltersByStatus(templates)];
	const hasSafetibase = templates.some((t) =>
		t?.modules?.some((module) => module.type === 'safetibase'),
	);
	if (hasSafetibase) {
		filters.push(getNonCompletedTicketFiltersBySafetibase());
	}
	return filters;
};

export const useViewerTicketFilterParams = () => {
	const { teamspace, project, containerOrFederation, revision } = useParams<ViewerParams>();
	const filters = TicketsCardHooksSelectors.selectFilters();
	const isFederation = !!FederationsHooksSelectors.selectFederationById(containerOrFederation);

	useEffect(() => {
		if (!containerOrFederation) return;
		TicketsCardActionsDispatchers.fetchFilteredTickets(teamspace, project, [containerOrFederation]);
	}, [filters, teamspace, project, containerOrFederation]);

	useEffect(() => {
		enableRealtimeTickets(teamspace, project, containerOrFederation, isFederation, revision);
	}, [containerOrFederation, revision, isFederation]);
};

export const useSetDefaultTicketFilters = (templates: ITemplate[]) => {
	const [ticketSearchParam, setTicketSearchParam] = useSearchParam('ticketSearch', Transformers.STRING_ARRAY);
	const templateIds = templates.map((t) => t._id).sort();
	useEffect(() => {
		if (!templates) return;
		const ticketCodes = ticketSearchParam
			.filter((query) => TICKET_CODE_REGEX.test(query))
			.map((q) => q.toUpperCase());
		const filters: CardFilter[] = ticketCodes.length
			? getTicketFiltersFromCodes(ticketCodes)
			: getNonCompletedTicketFilters(templates);
		filters.forEach(TicketsCardActionsDispatchers.upsertFilter);
		if (ticketCodes.length) {
			ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.TICKETS, true);
		}
		setTicketSearchParam();
	}, [JSON.stringify(templateIds), ticketSearchParam]);
};
