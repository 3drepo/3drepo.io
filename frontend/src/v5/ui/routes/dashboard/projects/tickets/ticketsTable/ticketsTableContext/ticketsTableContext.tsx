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

import { createContext } from 'react';
import { ITemplate } from '@/v5/store/tickets/tickets.types';
import { getTemplatePropertiesDefinitions } from './ticketsTableContext.helpers';
import { IssueProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';

export interface TicketsTableType {
	getPropertyDefaultValue: (name: string) => unknown;
	getPropertyType: (name: string) => string;
	isJobAndUsersType: (name: string) => boolean;
	groupByProperties: string[],
}

const defaultValue: TicketsTableType = {
	getPropertyDefaultValue: () => null,
	getPropertyType: () => null,
	isJobAndUsersType: () => false,
	groupByProperties: [],
};
export const TicketsTableContext = createContext(defaultValue);
TicketsTableContext.displayName = 'TicketsTableContext';

interface Props {
	children: any;
	template: ITemplate;
}
export const TicketsTableContextComponent = ({ children, template }: Props) => {
	const definitionsAsArray = getTemplatePropertiesDefinitions(template);
	const definitionsAsObject = definitionsAsArray.reduce(
		(acc, { name, ...definition }) => ({ ...acc, [name]: definition }),
		{},
	);

	const getPropertyDefaultValue = (name: string) => definitionsAsObject[name]?.default;
	const getPropertyType = (name: string) => definitionsAsObject[name]?.type;
	const isJobAndUsersType = (name: string) => (
		definitionsAsObject[name]?.values === 'jobsAndUsers'
		|| ['properties.Owner', 'properties.Assignees'].includes(name)
	);

	const groupByProperties = definitionsAsArray
		.filter((definition) => ['manyOf', 'oneOf'].includes(definition.type) || definition.name === `properties.${IssueProperties.DUE_DATE}`)
		.map((definition) => definition.name);
	
	return (
		<TicketsTableContext.Provider value={{
			getPropertyDefaultValue,
			getPropertyType,
			isJobAndUsersType,
			groupByProperties,
		}}>
			{children}
		</TicketsTableContext.Provider>
	);
};
