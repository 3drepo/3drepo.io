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

import { TicketsCardActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { uniq } from 'lodash';
import { useEffect } from 'react';
import { Transformers, useSearchParam } from '../../useSearchParam';
import { CardFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { ITemplate, StatusValue } from '@/v5/store/tickets/tickets.types';
import { TicketStatusDefaultValues, TicketStatusTypes, TreatmentStatuses } from '@controls/chip/chip.types';
import { selectStatusConfigByTemplateId } from '@/v5/store/tickets/tickets.selectors';
import { getState } from '@/v5/helpers/redux.helpers';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { enableRealtimeTickets } from '@/v5/services/realtime/ticketCard.events';
import { useParams } from 'react-router-dom';
import { ViewerParams } from '../../routes.constants';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';

type ITicketFiltersSetter = {
	templates: ITemplate[],
};

const TICKET_CODE_REGEX = /^[a-zA-Z]{3}:\d+$/;
export const TicketFiltersSetter = ({ templates }: ITicketFiltersSetter) => {
	const [ticketSearchParam, setTicketSearchParam] = useSearchParam('ticketSearch', Transformers.STRING_ARRAY);
	const { teamspace, project, containerOrFederation, revision } = useParams<ViewerParams>();
	const isFed = modelIsFederation(containerOrFederation);
	
	const cardFilters = TicketsCardHooksSelectors.selectCardFilters();

	useEffect(() => {
		TicketsCardActionsDispatchers.fetchFilteredTickets(teamspace, project, [containerOrFederation]);
	}, [cardFilters]);

	useEffect(() => 
		enableRealtimeTickets(teamspace, project, containerOrFederation, isFed, revision)
	, [containerOrFederation, revision, isFed]);


	const getTicketFiltersFromCodes = (values): CardFilter[] => [{
		module: '',
		property: 'Ticket ID',
		type: 'ticketCode',
		filter: {
			operator: 'is',
			values,
		},
	}];
	
	const getNonCompletedTicketFiltersByStatus = (): CardFilter => {
		const isCompletedValue = ({ type }: StatusValue) => [TicketStatusTypes.DONE, TicketStatusTypes.VOID].includes(type);
		const getValuesByTemplate = ({ _id }) => selectStatusConfigByTemplateId(getState(), _id).values;

		const completedValueNames = templates
			.flatMap(getValuesByTemplate)
			.filter(isCompletedValue)
			.map((v) => v.name);

		const values = uniq([
			TicketStatusDefaultValues.CLOSED,
			TicketStatusDefaultValues.VOID,
			...completedValueNames,
		]);

		return {
			module: '',
			property: 'Status',
			type: 'status',
			filter: {
				operator: 'nis',
				values,
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

	const getNonCompletedTicketFilters = (): CardFilter[] => {
		let filters = [getNonCompletedTicketFiltersByStatus()];
		const hasSafetibase = templates.some((t) => t?.modules?.some((module) => module.type === 'safetibase'));
		if (hasSafetibase) {
			filters.push(getNonCompletedTicketFiltersBySafetibase());
		}
		return filters;
	};

	useEffect(() => {
		if (templates.length) {
			const ticketCodes = ticketSearchParam.filter((query) => TICKET_CODE_REGEX.test(query)).map((q) => q.toUpperCase());
			const filters: CardFilter[] = ticketCodes.length ? getTicketFiltersFromCodes(ticketCodes) : getNonCompletedTicketFilters();
			filters.forEach(TicketsCardActionsDispatchers.upsertFilter);
			if (ticketCodes.length) {
				ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.TICKETS, true);
			}

			setTicketSearchParam();
		}
	}, [templates.length]); 

	return <></>;
};
