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
import { FormattedMessage } from 'react-intl';
import { getGroupNamePath } from '../groupsList.helpers';
import { GroupItemTextContainer, GroupItemName, GroupItemObjects } from './groupItem.styles';
import { GroupsTreeListItemComponent } from './groupItemContainer.component';
import { GroupIconComponent } from './groupIcon/groupIcon.component';

export const GroupItem = ({ group, disabled }) => {
	const overridden = GroupsHooksSelectors.selectGroupsColourOverridesSet().has(group._id);
	const highlighted = GroupsHooksSelectors.selectHighlightedGroups().has(group._id);
	const active = GroupsHooksSelectors.selectActiveGroupId() === group._id;

	const onClickOverride = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setColorOverrides([group._id], !overridden);
	};

	const onClickHighlight = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setActiveGroup(group);
	};

	const onClickGotoDetails = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.showDetails(group);
	};

	const path = getGroupNamePath(group.name);
	const depth = path.length;
	const name = path.pop();

	return (
		<GroupsTreeListItemComponent
			onClick={onClickHighlight}
			onClickGotoDetails={onClickGotoDetails}
			onClickOverride={onClickOverride}
			overridden={overridden}
			highlighted={highlighted}
			active={active}
			disabled={disabled}
			depth={depth}
		>
			<GroupIconComponent rules={group.rules} color={group.color} />
			<GroupItemTextContainer>
				<GroupItemName>
					{name}
				</GroupItemName>
				<GroupItemObjects>
					<FormattedMessage
						id="groups.item.numberOfMeshes"
						defaultMessage="{count, plural, =0 {No objects} one {# object} other {# objects}}"
						values={{ count: group.totalSavedMeshes }}
					/>
				</GroupItemObjects>
			</GroupItemTextContainer>
		</GroupsTreeListItemComponent>
	);
};
