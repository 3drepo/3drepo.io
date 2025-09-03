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
import { BaseFilter, TicketFilter } from './cardFilters.types';
import { ITemplate, TicketFilterKey } from '@/v5/store/tickets/tickets.types';
import { templatesToFilters } from './filtersSelection/tickets/ticketFilters.helpers';

type TicketFiltersDict = Record<TicketFilterKey, BaseFilter>;

export interface TicketsFiltersContextType {
	choosablefilters:  TicketFilter[];
	filters: TicketFiltersDict;
	templates: ITemplate[];
	setFilter: (filter:TicketFilter) => void;
}

const defaultValue: TicketsFiltersContextType = {
	choosablefilters: [],
	templates: [],
	filters: {},
	setFilter: () => {},
};

export const TicketsFiltersContext = createContext<TicketsFiltersContextType>(defaultValue);
TicketsFiltersContext.displayName = 'TicketsFiltersContext';

export const useTicketFiltersContext = () => useContext(TicketsFiltersContext);

interface TicketsFiltersContextComponentProps {
	children: any;
	templates: ITemplate[];
	presetFilters?: TicketFiltersDict;
	onChange?: (filters: TicketFiltersDict) => void;
}

export const TicketsFiltersContextComponent = ({ children, templates, presetFilters = {}, onChange }: TicketsFiltersContextComponentProps) => {
	const [filters, setFilters] = useState<TicketFiltersDict>(presetFilters);
	const [choosablefilters, setChoosablefilters] = useState<TicketFilter[]>([]);

	useEffect(() => {
		const newChoosableFilters = templatesToFilters(templates)
			.filter(({ module, property, type }) =>!filters[`${module}.${property}.${type}`]);
		setChoosablefilters(newChoosableFilters);
	}, [filters, templates]);

	const setFilter = useCallback(({ module, property, type, filter }: TicketFilter) => {
		setFilters({ ...filters, [`${module}.${property}.${type}`]: filter });
	}, [filters, setFilters]);

	useEffect(() => {
		onChange?.(filters);
	}, [filters, onChange]);

	return (
		<TicketsFiltersContext.Provider value={{ filters, setFilter, choosablefilters, templates }}>
			{children}
		</TicketsFiltersContext.Provider>
	);
};