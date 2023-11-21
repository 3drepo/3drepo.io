/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { GroupsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { GroupsHooksSelectors } from '@/v5/services/selectorsHooks';
import { ChevronButton } from '@controls/chevronButton';
import { SyntheticEvent } from 'react';
import { getGroupNamePath } from '../groupsList.helpers';
import { GroupSetName, GroupSetTitle, GroupsSetTreeListItemComponent } from './groupSetItem.styles';

const getGroupSetData = (groupSet, overrides, highlights) => {
	const data = groupSet.children.reduce((partialData, groupOrGroupSet:any) => {
		// eslint-disable-next-line prefer-const
		let { overridden, descendants, highlighted } = partialData;
		let childGroupSetData = null;
		let childHighlight = null;

		if (groupOrGroupSet.children) {
			childGroupSetData = getGroupSetData(groupOrGroupSet, overrides, highlights);
			childHighlight = childGroupSetData.highlight;
			descendants.push(...childGroupSetData.descendants);
		} else {
			descendants.push(groupOrGroupSet._id);
			childHighlight = highlights.has(groupOrGroupSet._id);
		}

		if (highlighted === null) {
			highlighted = childHighlight;
		}

		highlighted = highlighted && childHighlight;

		if (overridden !== undefined) {
			let childOverride = null;

			if (!groupOrGroupSet.children) {
				const groupId = (groupOrGroupSet)._id;
				childOverride = overrides.has(groupId);
			} else {
				childOverride = childGroupSetData.overridden;
			}

			overridden = overridden === null || overridden === childOverride ? childOverride : undefined;
		}

		return { overridden, descendants, highlight: highlighted };
	}, { overridden: null, descendants: [], highlighted: null });

	return data;
};

export const GroupSetItem = ({ groupSet, collapse, children, disabled }) => {
	const overrides = GroupsHooksSelectors.selectGroupsColourOverridesSet();
	const highlights = GroupsHooksSelectors.selectHighlightedGroups();

	const [collapseDict, setCollapseDict] = collapse;
	const hidden = collapseDict[groupSet.pathName] ?? true;

	const { overridden, descendants, highlighted } = getGroupSetData(groupSet, overrides, highlights);

	const onClickItem = (event: SyntheticEvent) => {
		event.stopPropagation();
		setCollapseDict({ ...collapseDict, [groupSet.pathName]: !hidden });
	};

	const onClickOverride = (event: SyntheticEvent) => {
		event.stopPropagation();
		// Comparing with false because overriden == undefined is used for indeterminate status on the checkbox
		GroupsActionsDispatchers.setColorOverrides(descendants, (overridden === false));
	};

	const depth = getGroupNamePath(groupSet.pathName).length;

	return (
		<GroupsSetTreeListItemComponent
			onClick={onClickItem}
			onClickOverride={onClickOverride}
			overridden={overridden}
			highlighted={highlighted}
			disabled={disabled}
			depth={depth}
			grandChildren={!hidden ? children : null}
			$padding={depth === 1}
		>
			<ChevronButton isOn={!hidden} size="small" />
			<GroupSetName>
				<GroupSetTitle>{groupSet.name}</GroupSetTitle>
				({descendants.length})
			</GroupSetName>
		</GroupsSetTreeListItemComponent>
	);
};
