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

import { GroupOverride } from '@/v5/store/tickets/tickets.types';
import { createContext } from 'react';
import { GroupState } from './ticketGroupsContext.helper';

type TicketGroupsContextType = {
	indexedOverrides: (GroupOverride & { index: number })[],
	groupType: 'colored' | 'hidden',
	editGroup: (index: number) => void,
	deleteGroup: (index: number) => void,
	deleteCollection: (indexes: number[]) => void,
	getGroupIsChecked: (index: number) => boolean,
	setGroupIsChecked: (index: number, isChecked: boolean) => void,
	getCollectionState: (indexes: number[]) => GroupState,
	highlightedIndex: number,
	setCollectionIsChecked: (indexes: number[], isChecked: boolean) => void,
	setHighlightedIndex: (index: number) => void,
	clearHighlightedIndex: () => void,
};

export const TicketGroupsContext = createContext<TicketGroupsContextType>({
	indexedOverrides: [],
	groupType: null,
	deleteGroup: () => {},
	deleteCollection: () => {},
	editGroup: () => {},
	setGroupIsChecked: () => {},
	getGroupIsChecked: () => null,
	setCollectionIsChecked: () => {},
	getCollectionState: () => null,
	highlightedIndex: -1,
	setHighlightedIndex: () => {},
	clearHighlightedIndex: () => {},
});
TicketGroupsContext.displayName = 'TicketGroupsContext';
