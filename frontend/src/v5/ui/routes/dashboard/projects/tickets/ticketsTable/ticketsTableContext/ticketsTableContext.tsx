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

import { createContext, useEffect } from 'react';
import { getTemplatePropertiesDefinitions, useSubscribableSearchParams } from './ticketsTableContext.helpers';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { useParams } from 'react-router';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';

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
	const [getSearchParam, setSearchParams, subscribeToSearchParam] = useSubscribableSearchParams();
	const { template: templateId, ...params } = useParams<DashboardTicketsParams>();
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

	useEffect(() => {
		if (params.ticketId) {
			// for backward compatibility, as the ticketId used to be set in the URL
			setSearchParams({ ticketId: params.ticketId });
		}
	}, []);

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
