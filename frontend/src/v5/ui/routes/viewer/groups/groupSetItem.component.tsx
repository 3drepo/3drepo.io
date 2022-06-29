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
import { SyntheticEvent } from 'react';

const getGroupSetData = (groupSet) => {
	// eslint-disable-next-line no-param-reassign

	const overrides = GroupsHooksSelectors.selectGroupsColourOverridesSet();
	const highlights = GroupsHooksSelectors.selectHighlightedGroups();

	const data = groupSet.children.reduce((partialData, groupOrGroupSet:any) => {
		// eslint-disable-next-line prefer-const
		let { override, descendants, highlight } = partialData;
		let childGroupSetData = null;
		let childHighlight = null;

		if (groupOrGroupSet.children) {
			childGroupSetData = getGroupSetData(groupOrGroupSet);
			childHighlight = childGroupSetData.highlight;
			Array.prototype.push.apply(descendants, childGroupSetData.descendants);
		} else {
			descendants.push(groupOrGroupSet._id);
			childHighlight = highlights.has(groupOrGroupSet._id);
		}

		if (highlight === null) {
			highlight = childHighlight;
		}

		highlight = highlight && childHighlight;

		if (override !== undefined) {
			let childOverride = null;

			if (!groupOrGroupSet.children) {
				const groupId = (groupOrGroupSet)._id;
				childOverride = overrides.has(groupId);
			} else {
				childOverride = childGroupSetData.override;
			}

			override = override === null || override === childOverride ? childOverride : undefined;
		}

		return { override, descendants, highlight };
	}, { override: null, descendants: [], highlight: null });

	return data;
};

export const GroupSetItem = ({ item, collapse, children }) => {
	const [collapseDict, setCollapse] = collapse;
	const hidden = collapseDict[item.pathName] ?? true;
	const hiddenIcon = hidden ? '^' : 'v';
	const { override, descendants, highlight } = getGroupSetData(item);

	const backgroundColor = highlight ? 'cyan' : 'white';

	const onClickItem = (event: SyntheticEvent) => {
		event.stopPropagation();
		setCollapse({ ...collapseDict, [item.pathName]: !hidden });
	};

	const onClickOverride = (event: SyntheticEvent) => {
		event.stopPropagation();
		GroupsActionsDispatchers.setColorOverrides(descendants, (override === false));
	};

	const onClickIsolate = (event) => {
		event.stopPropagation();
		GroupsActionsDispatchers.isolateGroups(descendants);
	};

	const indeterminate = override === undefined;
	const checked = !!override;

	return (
		<li
			onClick={onClickItem}
			onKeyDown={onClickItem}
			role="treeitem"
			style={{ cursor: 'default', backgroundColor }}
		>
			<b>{item.name} ({descendants.length})
				<Checkbox checked={checked} indeterminate={indeterminate} onClick={onClickOverride} />
				<button onClick={onClickIsolate} type="button">
					<span role="img" aria-label="isolate">👁️</span>
				</button>
				&nbsp; {hiddenIcon}
			</b>
			{!hidden && children}
		</li>
	);
};
