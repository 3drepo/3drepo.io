/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import { GroupOverride, OverrideType } from '@/v5/store/tickets/tickets.types';
import { sortBy } from 'lodash';
import { TicketGroupsContext, TicketGroupsContextType } from './ticketGroupsContext';

/* eslint-disable no-param-reassign */
type TicketGroupsContextComponentProps = {
	overrides: GroupOverride[],
	groupType: OverrideType,
	children: any,
	onOverrideAction?: (keys: string[]) => void,
	onDeleteGroups?: (keys: string[]) => void,
	onEditGroup?: (key?: string) => void,
	highlightedKey: string,
	setHighlightedKey: (key: string) => void,
	ref?: React.RefObject<TicketGroupsContextType | null>
};
export const TicketGroupsContextComponent = ({
	children,
	overrides,
	onOverrideAction = () => {},
	onDeleteGroups,
	onEditGroup,
	highlightedKey,
	ref,
	...contextValue
}: TicketGroupsContextComponentProps) => {
	const value: TicketGroupsContextType = {
		...contextValue,
		onOverrideAction,
		deleteGroup: (key) => onDeleteGroups([key]),
		deleteCollection: onDeleteGroups,
		editGroup: onEditGroup,
		overrides: sortBy(overrides || [], 'prefix'),
		highlightedKey,
	};

	if (ref) {
		ref.current = value;
	}

	return (
		<TicketGroupsContext.Provider value={value}>
			{children}
		</TicketGroupsContext.Provider>
	);
};
