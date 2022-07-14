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
import { isV5 } from '@/v4/helpers/isV5';
import { GroupsActionsDispatchers } from '@/v5/services/actionsDispatchers/groupsActions.dispatchers';
import { GroupsHooksSelectors } from '@/v5/services/selectorsHooks/groupsSelectors.hooks';
import { ChevronButton } from '@controls/chevronButton';
import { SyntheticEvent } from 'react';
import { getGroupNamePath } from '../groupList.helpers';
import { CollapsibleIconV4, GroupSetName, GroupsSetTreeListItemComponent } from './groupSetItem.styles';

const getGroupSetData = (groupSet, overrides, highlights) => {
	// eslint-disable-next-line no-param-reassign

	const data = groupSet.children.reduce((partialData, groupOrGroupSet:any) => {
		// eslint-disable-next-line prefer-const
		let { overriden, descendants, highlighted } = partialData;
		let childGroupSetData = null;
		let childHighlight = null;

		if (groupOrGroupSet.children) {
			childGroupSetData = getGroupSetData(groupOrGroupSet, overrides, highlights);
			childHighlight = childGroupSetData.highlight;
			Array.prototype.push.apply(descendants, childGroupSetData.descendants);
		} else {
			descendants.push(groupOrGroupSet._id);
			childHighlight = highlights.has(groupOrGroupSet._id);
		}

		if (highlighted === null) {
			highlighted = childHighlight;
		}

		highlighted = highlighted && childHighlight;

		if (overriden !== undefined) {
			let childOverride = null;

			if (!groupOrGroupSet.children) {
				const groupId = (groupOrGroupSet)._id;
				childOverride = overrides.has(groupId);
			} else {
				childOverride = childGroupSetData.overriden;
			}

			overriden = overriden === null || overriden === childOverride ? childOverride : undefined;
		}

		return { overriden, descendants, highlight: highlighted };
	}, { overriden: null, descendants: [], highlighted: null });

	return data;
};

const CollapsibleIcon = ({ $collapsed }) => (isV5()
	? <ChevronButton isOn={!$collapsed} size="small" />
	: <CollapsibleIconV4 $collapsed={$collapsed} />);

export const GroupSetItem = ({ groupSet, collapse, children, disabled }) => {
	const overrides = GroupsHooksSelectors.selectGroupsColourOverridesSet();
	const highlights = GroupsHooksSelectors.selectHighlightedGroups();

	const [collapseDict, setCollapse] = collapse;
	const hidden = collapseDict[groupSet.pathName] ?? true;

	const { overriden, descendants, highlighted } = getGroupSetData(groupSet, overrides, highlights);

	const onClickItem = (event: SyntheticEvent) => {
		event.stopPropagation();
		setCollapse({ ...collapseDict, [groupSet.pathName]: !hidden });
	};

	const onClickOverride = (event: SyntheticEvent) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setColorOverrides(descendants, (overriden === false));
	};

	const onClickIsolate = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.isolateGroups(descendants);
	};

	const depth = getGroupNamePath(groupSet.pathName).length;

	return (
		<GroupsSetTreeListItemComponent
			onClick={onClickItem}
			onClickIsolate={onClickIsolate}
			onClickOverride={onClickOverride}
			overriden={overriden}
			highlighted={highlighted}
			disabled={disabled}
			depth={depth}
			grandChildren={!hidden ? children : null}
			$padding={depth === 1}
		>
			<CollapsibleIcon $collapsed={hidden} />
			<GroupSetName>{groupSet.name} ({descendants.length}) </GroupSetName>
		</GroupsSetTreeListItemComponent>
	);
};
