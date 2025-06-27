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

import { createContext, useEffect, useRef } from 'react';
import { getTemplatePropertiesDefinitions } from './ticketsTableContext.helpers';
import { EventEmitter } from 'eventemitter3';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';

const useSubscribableSearchParam = () => {
	const emitterRef = useRef(new EventEmitter());
	const prevSearchParamsRef = useRef(Object.fromEntries(new URLSearchParams(window.location.search).entries()));

	const getValue = (name) => new URLSearchParams(window.location.search).get(name) || '';

	const updateValue = (name, value, searchParams) => {
		if (value) {
			searchParams.set(name, value);
			prevSearchParamsRef.current[name] = value;
		} else {
			searchParams.delete(name);
			delete prevSearchParamsRef.current[name];
		}
	};

	const setValues = (newValues: Record<string, string>, pushInHistory = false) => {
		const searchParams = new URLSearchParams(window.location.search);
		Object.entries(newValues).forEach(([name, value]) => {
			updateValue(name, value, searchParams);
			emitterRef.current.emit(name, value || '');
		});
		if (pushInHistory) {
			window.history.pushState({}, '', `${location.pathname}?${searchParams}`);
		} else {
			window.history.replaceState({}, '', `${location.pathname}?${searchParams}`);
		}
	};

	const subscribeToValueChange = (name, fn) => {
		emitterRef.current.on(name, fn);
		return () => emitterRef.current.off(name, fn);
	};

	useEffect(() => {
		const onPopState = () => {
			const searchParams = new URLSearchParams(window.location.search);
			const differentParams = [];

			searchParams.forEach((value, name) => {
				if (!prevSearchParamsRef.current[name]) {
					// new parameter
					differentParams.push(name);
					return;
				}

				if (getValue(name) !== prevSearchParamsRef.current[name]) {
					// changed parameter
					differentParams.push(name);
				}
			});

			Object.keys(prevSearchParamsRef.current).forEach((name) => {
				if (!searchParams.has(name)) {
					// removed parameter
					differentParams.push(name);
				}
			});
			differentParams.forEach((name) => emitterRef.current.emit(name, getValue(name)));
			prevSearchParamsRef.current = Object.fromEntries(searchParams.entries());
		};
		window.addEventListener('popstate', onPopState);
		return () => window.removeEventListener('popstate', onPopState);
	}, []);

	return [getValue, setValues, subscribeToValueChange] as const;
};

export interface TicketsTableType {
	getPropertyType: (name: string) => string;
	isJobAndUsersType: (name: string) => boolean;
	getSelectedTicket: () => string;
	getSelectedModel: () => string;
	onSelectedTicketChange: (fn: (ticketId: string) => void) => () => void;
	onSelectedModelChange: (fn: (containerOrFederation: string) => void) => () => void;
	setModelAndTicketId: (containerOrFederation: string, ticketId: string) => void;
}

const defaultValue: TicketsTableType = {
	getPropertyType: () => null,
	isJobAndUsersType: () => false,
	getSelectedTicket: () => '',
	getSelectedModel: () => '',
	onSelectedTicketChange: () => () => {},
	onSelectedModelChange: () => () => {},
	setModelAndTicketId: () => {},
};
export const TicketsTableContext = createContext(defaultValue);
TicketsTableContext.displayName = 'TicketsTableContext';

interface Props { children: any; }
export const TicketsTableContextComponent = ({ children }: Props) => {
	const [getSearchParam, setSearchParams, subscribeToSearchParam] = useSubscribableSearchParam();
	const { template: templateId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);

	const setModelAndTicketId = (containerOrFederation: string, ticketId: string) => setSearchParams({ containerOrFederation, ticketId });

	const definitionsAsArray = getTemplatePropertiesDefinitions(template);
	const definitionsAsObject = definitionsAsArray.reduce(
		(acc, { name, ...definition }) => ({ ...acc, [name]: definition }),
		{},
	);

	const getPropertyType = (name: string) => definitionsAsObject[name]?.type;
	const isJobAndUsersType = (name: string) => (
		definitionsAsObject[name]?.values === 'jobsAndUsers'
		|| ['properties.Owner', 'properties.Assignees'].includes(name)
	);

	return (
		<TicketsTableContext.Provider value={{
			getPropertyType,
			isJobAndUsersType,
			getSelectedTicket: () => getSearchParam('ticketId'),
			getSelectedModel: () => getSearchParam('containerOrFederation'),
			onSelectedTicketChange: (fn) => subscribeToSearchParam('ticketId', fn),
			onSelectedModelChange: (fn) => subscribeToSearchParam('containerOrFederation', fn),
			setModelAndTicketId,
		}}>
			{children}
		</TicketsTableContext.Provider>
	);
};
