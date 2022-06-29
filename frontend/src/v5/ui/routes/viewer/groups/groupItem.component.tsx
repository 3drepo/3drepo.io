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

import { GroupsActionsDispatchers } from '@/v5/services/actionsDispatchers/groupsActions.dispatchers';
import { GroupsHooksSelectors } from '@/v5/services/selectorsHooks/groupsSelectors.hooks';
import { Checkbox } from '@mui/material';

export const GroupItem = ({ item }) => {
	const isOverriden = GroupsHooksSelectors.selectGroupsColourOverridesSet().has(item._id);
	const isHighlighted = GroupsHooksSelectors.selectHighlightedGroups().has(item._id);
	const isActive = GroupsHooksSelectors.selectActiveGroupId() === item._id;
	const backgroundColor = isHighlighted ? 'cyan' : 'white';

	const onClickOverride = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setColorOverrides([item._id], !isOverriden);
	};

	const onClickIsolate = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.isolateGroups([item._id]);
	};

	const onClickHighlight = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setActiveGroup(item);
	};

	const onClickGotoDetails = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.showDetails(item);
	};

	return (
		<li
			role="treeitem"
			style={{ backgroundColor }}
			onClick={onClickHighlight}
			onKeyDown={onClickHighlight}
		>
			{item.name} objects: {item.objects.length}
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
		</li>
	);
};
