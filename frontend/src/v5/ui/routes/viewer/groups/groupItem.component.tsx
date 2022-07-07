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

import { hexToRgba } from '@/v4/helpers/colors';
import { GroupsActionsDispatchers } from '@/v5/services/actionsDispatchers/groupsActions.dispatchers';
import { GroupsHooksSelectors } from '@/v5/services/selectorsHooks/groupsSelectors.hooks';
import LightingIcon from '@assets/icons/lighting.svg';
import { Checkbox } from '@mui/material';
import { GroupIcon, GroupsTreeListItem } from './groupLists.styles';

const isSmart = (group) => !group.objects || !!group.rules;

const GroupIconComponent = ({ group }) => (
	<GroupIcon $color={hexToRgba(group.color)} $variant="light">
		{isSmart(group) && <LightingIcon /> }
	</GroupIcon>
);

export const GroupItem = ({ group }) => {
	const isOverriden = GroupsHooksSelectors.selectGroupsColourOverridesSet().has(group._id);
	const isHighlighted = GroupsHooksSelectors.selectHighlightedGroups().has(group._id);
	const isActive = GroupsHooksSelectors.selectActiveGroupId() === group._id;

	const onClickOverride = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setColorOverrides([group._id], !isOverriden);
	};

	const onClickIsolate = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.isolateGroups([group._id]);
	};

	const onClickHighlight = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setActiveGroup(group);
	};

	const onClickGotoDetails = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.showDetails(group);
	};

	return (
		<GroupsTreeListItem
			onClick={onClickHighlight}
			$highlighted={isHighlighted}
		>
			HELLO
			[<GroupIconComponent group={group} />]
			THERE
			{group.name} objects: {group.objects.length}
			<Checkbox checked={isOverriden} onClick={onClickOverride} />
			<button onClick={onClickIsolate} type="button">
				<span role="img" aria-label="isolate">👁️</span>
			</button>

			{isActive
			&& (
				<button onClick={onClickGotoDetails} type="button">
					<span role="img" aria-label="isolate">➡</span>
				</button>
			)}
		</GroupsTreeListItem>
	);
};
