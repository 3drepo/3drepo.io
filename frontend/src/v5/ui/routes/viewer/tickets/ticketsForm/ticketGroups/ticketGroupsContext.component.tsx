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
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { TicketGroupsContext } from './ticketGroupsContext';
import { GroupState } from './ticketGroupsContext.helper';

/* eslint-disable no-param-reassign */
type TicketGroupsContextComponentProps = {
	overrides: GroupOverride[],
	groupType: 'colored' | 'hidden',
	children: any,
	onSelectedGroupsChange?: (keys: string[]) => void,
	onDeleteGroups?: (keys: string[]) => void,
	onEditGroup?: (key?: string) => void,
	highlightedKey: string,
	setHighlightedKey: (key: string) => void,
	clearHighlightedKey: () => void,
};
export const TicketGroupsContextComponent = ({
	children,
	overrides,
	onDeleteGroups,
	onSelectedGroupsChange,
	onEditGroup,
	highlightedKey,
	clearHighlightedKey,
	...contextValue
}: TicketGroupsContextComponentProps) => {
	const [checkedKeys, setCheckedKeys] = useState<string[]>(overrides.map(({ key }) => key).filter(Boolean));
	const previousKeys = useRef(new Set(checkedKeys));

	const getGroupIsChecked = (key: string) => checkedKeys.includes(key);

	const setGroupIsChecked = (key: string, state: boolean) => setCheckedKeys(
		state ? _.union(checkedKeys, [key]) : _.without(checkedKeys, key),
	);

	const getCollectionState = (keys: string[] = []) => {
		if (!keys.length) return GroupState.UNCHECKED;
		const firstDescendantState = getGroupIsChecked(keys[0]);
		if (!keys.every((key) => getGroupIsChecked(key) === firstDescendantState)) return GroupState.INDETERMINATE;
		return firstDescendantState ? GroupState.CHECKED : GroupState.UNCHECKED;
	};

	const setCollectionIsChecked = (keys: string[], state: boolean) => setCheckedKeys(
		state ? _.union(checkedKeys, keys) : _.without(checkedKeys, ...keys),
	);

	useEffect(() => {
		const keys = overrides.map(({ key }) => key).filter(Boolean);
		const newKeys = keys.filter((key) => !previousKeys.current.has(key));
		setCheckedKeys((currentKeys) => _.union(
			_.intersection(currentKeys, keys),
			newKeys,
		));
		previousKeys.current = new Set(keys);
	}, [overrides]);

	useEffect(() => {
		onSelectedGroupsChange(checkedKeys);
	}, [checkedKeys]);

	return (
		<TicketGroupsContext.Provider
			value={{
				...contextValue,
				deleteGroup: (key) => onDeleteGroups([key]),
				deleteCollection: onDeleteGroups,
				editGroup: onEditGroup,
				getGroupIsChecked,
				setGroupIsChecked,
				setCollectionIsChecked,
				getCollectionState,
				overrides: _.sortBy(overrides || [], 'prefix'),
				highlightedKey,
				clearHighlightedKey,
			}}
		>
			{children}
		</TicketGroupsContext.Provider>
	);
};
