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
import { TicketsCardHooksSelectors, TicketsHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ViewerParams } from '../../routes.constants';
import { Transformers, useSearchParam } from '../../useSearchParam';
import { TicketFilter } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { VIEWER_PANELS } from '@/v4/constants/viewerGui';
import { enableRealtimeTickets } from '@/v5/services/realtime/ticketCard.events';
import { deserializeFilter, getNonCompletedTicketFilters, getTicketFilterFromCodes, serializeFilter } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { isEqual } from 'lodash';

const TICKET_CODE_REGEX = /^[a-zA-Z]{3}:\d+$/;
export const TicketFiltersSetter = () => {
	const [ticketSearchParam, setTicketSearchParam] = useSearchParam('ticketSearch', Transformers.STRING_ARRAY);
	const [urlFiltersRaw, setUrlFilters] = useSearchParam('filters');
	const templates = TicketsCardHooksSelectors.selectCurrentTemplates();
	const { teamspace, project, containerOrFederation, revision } = useParams<ViewerParams>();
	const isFed = modelIsFederation(containerOrFederation);

	const cardFilters = TicketsCardHooksSelectors.selectCardFilters();
	const riskCategories = TicketsHooksSelectors.selectRiskCategories();
	const jobsAndUsers = UsersHooksSelectors.selectJobsAndUsersByIds();
	const filtersFromState = TicketsCardHooksSelectors.selectCardFilters();

	const defaultFiltersForTemplate = getNonCompletedTicketFilters(templates, containerOrFederation);

	useEffect(() => {
		TicketsCardActionsDispatchers.fetchFilteredTickets(teamspace, project, containerOrFederation, isFed);
	}, [cardFilters]);

	useEffect(() => 
		enableRealtimeTickets(teamspace, project, containerOrFederation, isFed, revision)
	, [containerOrFederation, revision, isFed]);

	/**
	 * When the filter objects are changed this bit changes
	 * the url search param.
	*/
	useEffect(() => {
		if (!filtersFromState || !templates.length) return;

		let param = JSON.stringify(filtersFromState.map((f) => 
			serializeFilter(templates, f, jobsAndUsers, riskCategories),
		));

		// When there are no paramFilters that means the defaultfilters are there so no need to update the url
		if ((isEqual(defaultFiltersForTemplate, filtersFromState) && !urlFiltersRaw.length)
			|| (urlFiltersRaw === param) || (!urlFiltersRaw.length && !filtersFromState.length) // if filters from URL and state are the same do nothing
		) return;
		setUrlFilters(param);
	}, [JSON.stringify(filtersFromState), templates.length]);

	useEffect(() => {
		if (templates.length) {
			let filtersToSet: TicketFilter[] = [];
			TicketsCardActionsDispatchers.resetFilters();
			const ticketCodes = ticketSearchParam.filter((query) => TICKET_CODE_REGEX.test(query)).map((q) => q.toUpperCase());
			if (ticketCodes.length) {
				filtersToSet = [getTicketFilterFromCodes(ticketCodes)];
			} else if (urlFiltersRaw.length) {
				filtersToSet = JSON.parse(urlFiltersRaw).reduce((acc, urlFilter) => {
					return [...acc, deserializeFilter(templates, urlFilter, jobsAndUsers, riskCategories)];
				}, []);
			} else {
				filtersToSet = defaultFiltersForTemplate;
			}
			
			TicketsCardActionsDispatchers.setFilters(filtersToSet);

			if (ticketCodes.length || urlFiltersRaw?.length) {
				ViewerGuiActionsDispatchers.setPanelVisibility(VIEWER_PANELS.TICKETS, true);
			}

			setTicketSearchParam();
		}
	}, [templates.length]); 

	return <></>;
};
