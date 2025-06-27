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

import { createContext, useRef } from 'react';
import { getTemplatePropertiesDefinitions } from './ticketsTableContext.helpers';
import { EventEmitter } from 'eventemitter3';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';

const useSubscribableSearchParam = (name) => {
	const emitterRef = useRef(new EventEmitter());

	const getValue = () => new URLSearchParams(window.location.search).get(name) ?? '';

	const setValue = (val, pushInHistory = false) => {
		const value = val ?? '';
		const searchParams = new URLSearchParams(window.location.search);

		if (value) {
			searchParams.set(name, value);
		} else {
			searchParams.delete(name);
		}
	
		if (pushInHistory) {
			window.history.pushState({}, '', `${location.pathname}?${searchParams.toString()}`);
		} else {
			window.history.replaceState({}, '', `${location.pathname}?${searchParams.toString()}`);
		}
		emitterRef.current.emit(name, value);
	};

	const subscribeToValueChange = (fn) => {
		emitterRef.current.on(name, fn);
		return () => emitterRef.current.off(name, fn);
	};

	return [getValue, setValue, subscribeToValueChange] as const;
};

export interface TicketsTableType {
	getPropertyType: (name: string) => string;
	isJobAndUsersType: (name: string) => boolean;
	onSelectedTicketChange: (fn: (ticketId: string) => void) => () => void;
	setSelectedTicket: (ticketId: string) => void;
	getSelectedTicket: () => string;
	onSelectedModelChange: (fn: (modelId: string) => void) => () => void;
	setSelectedModel: (modelId: string) => void;
	getSelectedModel: () => string;
}

const defaultValue: TicketsTableType = {
	getPropertyType: () => null,
	isJobAndUsersType: () => false,
	onSelectedTicketChange: () => () => {},
	setSelectedTicket: () => {},
	getSelectedTicket: () => '',
	onSelectedModelChange: () => () => {},
	setSelectedModel: () => {},
	getSelectedModel: () => '',
};
export const TicketsTableContext = createContext(defaultValue);
TicketsTableContext.displayName = 'TicketsTableContext';

interface Props { children: any; }
export const TicketsTableContextComponent = ({ children }: Props) => {
	const { template: templateId } = useParams<DashboardTicketsParams>();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);
	const [getSelectedTicket, setSelectedTicket, onSelectedTicketChange] = useSubscribableSearchParam('ticketId');
	const [getSelectedModel, setSelectedModel, onSelectedModelChange] = useSubscribableSearchParam('containerOrFederation');

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
			onSelectedTicketChange,
			setSelectedTicket,
			getSelectedTicket,
			onSelectedModelChange,
			setSelectedModel,
			getSelectedModel,
		}}>
			{children}
		</TicketsTableContext.Provider>
	);
};
