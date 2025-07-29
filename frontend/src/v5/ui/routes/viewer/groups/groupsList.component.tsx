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
 
import { useEffect, useState } from 'react';
import { GroupsListContainer, GroupsTreeList } from './groupsLists.styles';
import { GroupSetItem } from './groupItem/groupSetItem.component';
import { GroupItem } from './groupItem/groupItem.component';
import { groupsToTree } from './groupsList.helpers';

interface Props {
	groups: any [];
	collapse: [state: object, setState: (any)=>void];
	disabled: boolean;
}

const GroupTreeItem = ({ item, collapse, disabled }) => {
	if (item.children) {
		return (
			<GroupSetItem groupSet={item} collapse={collapse} disabled={disabled}>
				<GroupTree tree={item.children} collapse={collapse} disabled={disabled} />
			</GroupSetItem>
		);
	}

	return (<GroupItem group={item} disabled={disabled} />);
};

export const GroupTree = ({ tree, collapse, disabled }) => (
	<GroupsTreeList>
		{tree.map((item) => (
			<GroupTreeItem item={item} collapse={collapse} disabled={disabled} key={item._id || item.name} />
		))}
	</GroupsTreeList>
);

export const GroupsListComponent = ({ groups, collapse, disabled }:Props) => {
	const [tree, setTree] = useState([]);

	useEffect(() => {
		setTree(groupsToTree(groups));
	}, [groups]);

	return (
		<GroupsListContainer>
			<GroupTree tree={tree} collapse={collapse} disabled={disabled} />
		</GroupsListContainer>
	);
};
