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

import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { intersection, isEqual, isString, sortBy, union, without } from 'lodash';
import { TreeActions } from '@/v4/modules/tree';
import { convertToV4GroupNodes, toGroupPropertiesDicts } from '@/v5/helpers/viewpoint.helpers';
import { TicketsCardActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Group, GroupOverride, OverrideType } from '@/v5/store/tickets/tickets.types';
import { TicketGroupsContext, TicketGroupsContextType } from './ticketGroupsContext';
import { TicketGroupsColouredContext, TicketGroupsColouredContextType } from './ticketGroupsColouredContext';
import { GroupState } from './ticketGroupsContext.helper';

type ColouredGroupsContextComponentProps = {
	overrides: GroupOverride[],
	children: any,
	hasClearedOverrides: boolean,
	highlightedKey: string,
	setHighlightedKey: (key: string) => void,
	onDeleteGroups?: (keys: string[]) => void,
	onEditGroup?: (key?: string) => void,
};

const getGroupKey = ({ group, key }: GroupOverride): string => (isString(group) ? group : group._id) || key || '';

export const ColouredGroupsContextComponent = ({
	children,
	overrides,
	hasClearedOverrides,
	highlightedKey,
	setHighlightedKey,
	onDeleteGroups,
	onEditGroup,
}: ColouredGroupsContextComponentProps) => {
	const dispatch = useDispatch();
	const keys = overrides.map(getGroupKey).filter(Boolean);
	const previousKeys = useRef(new Set(keys));
	const [checkedKeys, setCheckedKeys] = useState(keys);
	const [initialized, setInitialized] = useState(false);

	const applyOverrides = (activeKeys: string[]) => {
		const activeOverrides = overrides
			.filter((override) => activeKeys.includes(getGroupKey(override)) && !isString(override.group));
		const objects = activeOverrides.flatMap(({ group }) => convertToV4GroupNodes(group as Group));

		if (objects.length) {
			dispatch(TreeActions.deselectNodesBySharedIds(objects));
		}
		TicketsCardActionsDispatchers.setOverrides(toGroupPropertiesDicts(activeOverrides));
	};

	useEffect(() => {
		const newKeys = keys.filter((key) => !previousKeys.current.has(key));
		const nextKeys = union(intersection(checkedKeys, keys), newKeys);
		previousKeys.current = new Set(keys);
		if (!isEqual(nextKeys, checkedKeys)) setCheckedKeys(nextKeys);
	}, [overrides]);

	useEffect(() => {
		applyOverrides(checkedKeys);
		if (initialized) return;
		setInitialized(overrides.every((override) => checkedKeys.includes(getGroupKey(override)) && !isString(override.group)));
	}, [checkedKeys, overrides]);

	useEffect(() => {
		if (!hasClearedOverrides || !initialized) return;
		setCheckedKeys([]);
	}, [hasClearedOverrides, initialized]);

	const getGroupIsChecked = (key: string) => checkedKeys.includes(key);
	const setCollectionCheck = (collectionKeys: string[], isChecked: boolean) => {
		const nextKeys = isChecked
			? union(checkedKeys, collectionKeys)
			: without(checkedKeys, ...collectionKeys);
		setCheckedKeys(nextKeys);
		return nextKeys;
	};
	const getCollectionState = (collectionKeys: string[] = []) => {
		if (!collectionKeys.length) return GroupState.UNCHECKED;
		const firstState = getGroupIsChecked(collectionKeys[0]);
		if (!collectionKeys.every((key) => getGroupIsChecked(key) === firstState)) return GroupState.INDETERMINATE;
		return firstState ? GroupState.CHECKED : GroupState.UNCHECKED;
	};
	const toggleCollectionCheck = (collectionKeys: string[]) => {
		const checked = getCollectionState(collectionKeys) !== GroupState.CHECKED;
		return setCollectionCheck(collectionKeys, checked);
	};

	const colouredValue: TicketGroupsColouredContextType = {
		getGroupIsChecked,
		setCollectionCheck,
		toggleCollectionCheck,
		getCollectionState,
		clearAllChecks: () => setCheckedKeys([]),
	};

	const value: TicketGroupsContextType = {
		overrides: sortBy(overrides, 'prefix'),
		groupType: OverrideType.COLORED,
		onOverrideAction: toggleCollectionCheck,
		deleteGroup: (key) => onDeleteGroups?.([key]),
		deleteCollection: onDeleteGroups || (() => {}),
		editGroup: onEditGroup || (() => {}),
		highlightedKey,
		setHighlightedKey,
	};

	return (
		<TicketGroupsContext.Provider value={value}>
			<TicketGroupsColouredContext.Provider value={colouredValue}>
				{children}
			</TicketGroupsColouredContext.Provider>
		</TicketGroupsContext.Provider>
	);
};
