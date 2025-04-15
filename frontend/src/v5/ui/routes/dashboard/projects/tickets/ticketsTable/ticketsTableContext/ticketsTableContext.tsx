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
import { getPropertiesDefinition } from './ticketsTableContext.helpers';
import { get } from 'lodash';

export interface TicketsTableType {
	getDefaultValue: (name: string) => unknown;
	getPropertyType: (name: string) => string;
}

const defaultValue: TicketsTableType = {
	getDefaultValue: () => null,
	getPropertyType: () => null,
};
export const TicketsTableContext = createContext(defaultValue);
TicketsTableContext.displayName = 'ResizeableColumns';

interface Props {
	children: any;
	template: ITemplate;
}
export const TicketsTableContextComponent = ({ children, template }: Props) => {
	const definitions = getPropertiesDefinition(template);

	const getDefaultValue = (name: string) => get(definitions, name)?.default;
	const getPropertyType = (name: string) => get(definitions, name)?.type;

	return (
		<TicketsTableContext.Provider value={{
			getDefaultValue,
			getPropertyType,
		}}>
			{children}
		</TicketsTableContext.Provider>
	);
};
