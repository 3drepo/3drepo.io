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

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { TicketFilter } from './cardFilters.types';
import { ITemplate, ITicket } from '@/v5/store/tickets/tickets.types';
import { deserializeFilter, getNonCompletedTicketFilters, getTemplateFilter, serializeFilter, templatesToFilters } from './filtersSelection/tickets/ticketFilters.helpers';
import { FederationsHooksSelectors, TicketsHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { apiFetchFilteredTickets } from '@/v5/store/tickets/card/ticketsCard.sagas';
import { useParams } from 'react-router-dom';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { isEmpty, isEqual } from 'lodash';
import { templateAlreadyFetched } from '@/v5/store/tickets/tickets.helpers';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';

type DisplayMode = 'card' | 'other';
export interface TicketsFiltersContextType {
	choosablefilters:  TicketFilter[];
	filters: TicketFilter[];
	templates: ITemplate[];
	modelsIds: string[];
	setFilter: (filter:TicketFilter) => void;
	deleteFilter: (filter:TicketFilter) => void;
	clearFilters: () => void;
	isFiltering: boolean;
	displayMode: DisplayMode;
	filteredTickets: ITicket[];
}

const defaultValue: TicketsFiltersContextType = {
	choosablefilters: [],
	templates: [],
	modelsIds: [],
	filters: [],
	setFilter: () => {},
	deleteFilter: () => {},
	clearFilters: () => {},
	isFiltering: false,
	displayMode: 'other',
	filteredTickets: [],
};

export const TicketsFiltersContext = createContext<TicketsFiltersContextType>(defaultValue);
TicketsFiltersContext.displayName = 'TicketsFiltersContext';

export const useTicketFiltersContext = () => useContext(TicketsFiltersContext);

interface TicketsFiltersContextComponentProps {
	children: any;
	templates: ITemplate[];
	modelsIds: string[];
	filters?: TicketFilter[];
	isFiltering?: boolean;
	onChange?: (filters: TicketFilter[]) => void;
	displayMode?: DisplayMode;
}

const findFilterIndex = (filters:TicketFilter[], filter:TicketFilter) =>
	filters.findIndex((f) => f.module === filter.module && f.property === filter.property && f.type === filter.type);

export const TicketsFiltersContextComponent = ({
	children, 
	templates, 
	modelsIds, 
	filters: filtersProps,
	displayMode,
	onChange }: TicketsFiltersContextComponentProps) => {
	const { teamspace, project } = useParams<DashboardTicketsParams>();
	const [filters, setFilters] = useState<TicketFilter[]>();
	const [choosablefilters, setChoosablefilters] = useState<TicketFilter[]>([]);
	const [paramFilters, setParamFilters] = useSearchParam<string>('filters', undefined, true);
	const [isFiltering, setIsFiltering] = useState<boolean>(false);
	const tickets = TicketsHooksSelectors.selectTicketsByContainersAndFederations(modelsIds);
	const [filteredTickets, setFilteredTickets] = useState<ITicket[]>(tickets);

	const riskCategories = TicketsHooksSelectors.selectRiskCategories();
	const jobsAndUsers = UsersHooksSelectors.selectJobsAndUsersByIds();
	const isFed = FederationsHooksSelectors.selectIsFederation();
	const templatesAreFetched = templates.every((template) => templateAlreadyFetched(template));
	
	const setFilter = useCallback((filter: TicketFilter) => {
		const index = findFilterIndex(filters, filter);
		const newFilters = [...filters];

		if (index === -1) {
			newFilters.push(filter);
		} else {
			newFilters[index] = filter;
		} 

		setFilters(newFilters);
	}, [filters]);

	const deleteFilter = useCallback((filter:TicketFilter) => {
		const index = findFilterIndex(filters, filter);
		setFilters(filters.filter((f, i) => i !== index));
	}, [filters]);

	useEffect(() => {
		const usedFilters = new Set((filters || []).map(({ module, property, type })=> `${module}.${property}.${type}`));
		const newChoosableFilters = templatesToFilters(templates)
			.filter(({ module, property, type }) =>!usedFilters.has(`${module}.${property}.${type}`));
		setChoosablefilters(newChoosableFilters);
	}, [filters, JSON.stringify(templates)]);

	useEffect(() => {
		if (!filtersProps) return;
		setFilters(filtersProps);
	}, [filtersProps]);
	
	/**
	 * When the filter objects are changed this bit changes
	 * the url search param.
	 */
	useEffect(() => {
		if (!filters || !templatesAreFetched) return;

		const defaultFilters = getNonCompletedTicketFilters(templates, modelsIds[0]);

		let param = JSON.stringify(filters.map((f) => 
			serializeFilter(templates, f, jobsAndUsers, riskCategories),
		));

		// When there are no paramFilters that means the defaultfilters are there so no need to update the url
		if (isEqual(defaultFilters, filters) && !paramFilters) return;
		if (paramFilters === param) return;
		setParamFilters(param);
		onChange?.(filters);
	}, [JSON.stringify(filters), templatesAreFetched]);

	const clearFilters = () => {
		setFilters([]);
	};

	/**
	 * This part react to the filters in the url being changed and
	 * set the actual filters.
	 * If there is no filters in the url it sets the default filters
	 */
	useEffect(() => {
		if (!templatesAreFetched) return;
		
		if (!paramFilters) {
			const newFilters  = getNonCompletedTicketFilters(templates, modelsIds[0]);
			if (isEqual(newFilters, filters)) return;
			setFilters(newFilters);
			return;
		}
	
		if (!riskCategories.length || isEmpty(jobsAndUsers)) return;
		
		try {
		// Dont blank the page if the url param has the wrong format
			const newFilters = JSON.parse(paramFilters).map((f) => {
				try {
					return deserializeFilter(templates, f, jobsAndUsers, riskCategories);
				} catch (e) {
					console.error('Error parsing the url filter param');
					console.error(e);
					return undefined;
				}
			}).filter(Boolean);
			if (isEqual(newFilters, filters)) return;
			setFilters(newFilters);
			TicketsCardActionsDispatchers.setFilters(newFilters);

		} catch (e) {
			console.error('Error parsing the url filter param');
			console.error(e);
			return undefined;
		}
	}, [templatesAreFetched, JSON.stringify(templates.map(({ _id }) => _id)), modelsIds, jobsAndUsers, /* JSON.stringify(filters), */ riskCategories]);

	useEffect(() => {
		setIsFiltering(true);

		if (!filters) return;
		let mounted = true;
		(async () => {
			const templateFilter = getTemplateFilter(templates.map(({ code }) => code));
			const allFilters = [...filters, templateFilter];

			const idsSets:Set<string>[] =  await Promise.all(modelsIds.map(
				(id) => apiFetchFilteredTickets(teamspace, project, id, isFed(id), allFilters)),
			);

			if (!mounted) return;
			const idsSet = new Set<string>();
			idsSets.forEach((idSetPerContainer) => {
				for (let id of idSetPerContainer) {
					idsSet.add(id);
				}
			});
			TicketsCardActionsDispatchers.setFilteredTicketIds(idsSet);
			setFilteredTickets(tickets.filter((t) => idsSet.has(t._id)));
			setIsFiltering(false);
		})();

		return () => { mounted = false;};
	}, [modelsIds,  JSON.stringify(templates.map(({ _id }) => _id)), JSON.stringify(filters)]);

	return (
		<TicketsFiltersContext.Provider value={{ 
			displayMode, 
			filters: filters || [], 
			setFilter, 
			deleteFilter, 
			clearFilters, 
			choosablefilters,
			isFiltering,
			templates, 
			modelsIds,
			filteredTickets,
		}}>
			{children}
		</TicketsFiltersContext.Provider>
	);
};