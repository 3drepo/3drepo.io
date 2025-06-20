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

import { createContext, useState } from 'react';
import { getTemplatePropertiesDefinitions } from './ticketsTableContext.helpers';
import { IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { useParams } from 'react-router';
import { DashboardTicketsParams } from '@/v5/ui/routes/routes.constants';
import { FederationsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { TicketsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { stripModuleOrPropertyPrefix } from '../ticketsTable.helper';
import { ITicket, PropertyTypeDefinition } from '@/v5/store/tickets/tickets.types';
import { chunk } from 'lodash';

export interface TicketsTableType {
	getPropertyType: (name: string) => PropertyTypeDefinition;
	isJobAndUsersType: (name: string) => boolean;
	groupByProperties: string[],
	groupBy: string,
	setGroupBy: (groupBy: React.SetStateAction<string>) => void;
	fetchColumn: (name: string, tickets: ITicket[]) => void;
}

const defaultValue: TicketsTableType = {
	getPropertyType: () => null,
	isJobAndUsersType: () => false,
	groupByProperties: [],
	groupBy: '',
	setGroupBy: () => {},
	fetchColumn: () => {},
};
export const TicketsTableContext = createContext(defaultValue);
TicketsTableContext.displayName = 'TicketsTableContext';

interface Props {
	children: any;
}
export const TicketsTableContextComponent = ({ children }: Props) => {
	const [groupBy, setGroupBy] = useState('');
	const { teamspace, project, template: templateId } = useParams<DashboardTicketsParams>();
	const isFed = FederationsHooksSelectors.selectIsFederation();
	const template = ProjectsHooksSelectors.selectCurrentProjectTemplateById(templateId);

	const definitionsAsArray = getTemplatePropertiesDefinitions(template);
	const definitionsAsObject = definitionsAsArray.reduce(
		(acc, { name, ...definition }) => ({ ...acc, [name]: definition }),
		{},
	);

	const fetchColumn = (name, tickets: ITicket[]) => {
		const idsByModelId = tickets.reduce((acc, { _id: ticketId, modelId }) => {
			if (!acc[modelId]) {
				acc[modelId] = [];
			}
			acc[modelId].push(ticketId);
			return acc;
		},  {} ) as Record<string, string[]>;

		Object.keys(idsByModelId).map((modelId) => {
			const ids = idsByModelId[modelId];
			const isFederation = isFed(modelId);
			const chunks = chunk(ids, 200);
			chunks.forEach((idsChunk) => {
				TicketsActionsDispatchers.fetchTicketsProperties(
					teamspace,
					project,
					modelId,
					idsChunk,
					template.code,
					isFederation,
					[stripModuleOrPropertyPrefix(name)],
				);
			});
		});
	};

	const getPropertyType = (name: string) => definitionsAsObject[name]?.type as PropertyTypeDefinition;
	const isJobAndUsersType = (name: string) => (
		definitionsAsObject[name]?.values === 'jobsAndUsers'
		|| ['properties.Owner', 'properties.Assignees'].includes(name)
	);

	const groupByProperties = definitionsAsArray
		.filter((definition) => ['manyOf', 'oneOf'].includes(definition.type) || definition.name === `properties.${IssueProperties.DUE_DATE}`)
		.map((definition) => definition.name);
	
	return (
		<TicketsTableContext.Provider value={{
			getPropertyType,
			isJobAndUsersType,
			groupByProperties,
			groupBy,
			setGroupBy,
			fetchColumn,
		}}>
			{children}
		</TicketsTableContext.Provider>
	);
};
