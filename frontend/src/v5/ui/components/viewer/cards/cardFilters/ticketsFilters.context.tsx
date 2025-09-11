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
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { templatesToFilters } from './filtersSelection/tickets/ticketFilters.helpers';
export interface TicketsFiltersContextType {
	choosablefilters:  TicketFilter[];
	filters: TicketFilter[];
	templates: ITemplate[];
	modelsIds: string[];
	setFilter: (filter:TicketFilter) => void;
	deleteFilter: (filter:TicketFilter) => void;
}

const defaultValue: TicketsFiltersContextType = {
	choosablefilters: [],
	templates: [],
	modelsIds: [],
	filters: [],
	setFilter: () => {},
	deleteFilter: () => {},
};

export const TicketsFiltersContext = createContext<TicketsFiltersContextType>(defaultValue);
TicketsFiltersContext.displayName = 'TicketsFiltersContext';

export const useTicketFiltersContext = () => useContext(TicketsFiltersContext);

interface TicketsFiltersContextComponentProps {
	children: any;
	templates: ITemplate[];
	modelsIds: string[];
	presetFilters?: TicketFilter[];
	onChange?: (filters: TicketFilter[]) => void;
}

const findFilterIndex = (filters:TicketFilter[], filter:TicketFilter) =>
	filters.findIndex((f) => f.module === filter.module && f.property === filter.property && f.type === filter.type);

export const TicketsFiltersContextComponent = ({
	children, 
	templates, 
	modelsIds, 
	presetFilters = [], 
	onChange }: TicketsFiltersContextComponentProps) => {
	const [filters, setFilters] = useState<TicketFilter[]>(presetFilters);
	const [choosablefilters, setChoosablefilters] = useState<TicketFilter[]>([]);
	
	useEffect(() => {
		const usedFilters = new Set(filters.map(({ module, property, type })=> `${module}.${property}.${type}`));
		const newChoosableFilters = templatesToFilters(templates)
			.filter(({ module, property, type }) =>!usedFilters.has(`${module}.${property}.${type}`));
		setChoosablefilters(newChoosableFilters);
	}, [filters, templates]);
	
	const setFilter = useCallback((filter: TicketFilter) => {
		const index = findFilterIndex(filters, filter);
		const newFilters = [...filters];

		if (index === -1) {
			newFilters.push(filter);
		} else {
			newFilters[index] = filter;
		} 

		setFilters(newFilters);
	}, [filters, setFilters]);

	const deleteFilter = useCallback((filter:TicketFilter) => {
		const index = findFilterIndex(filters, filter);
		setFilters(filters.filter((f, i) => i !== index));
	}, [filters]);
	
	useEffect(() => {
		onChange?.(filters);
	}, [filters, onChange]);

	return (
		<TicketsFiltersContext.Provider value={{ filters, setFilter, deleteFilter, choosablefilters, templates, modelsIds }}>
			{children}
		</TicketsFiltersContext.Provider>
	);
};