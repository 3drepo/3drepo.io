/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { memoize } from 'lodash';
import React from 'react';

import { getAvatarUrl } from '../../../../services/api';
import { TreeList, TREE_LEVELS } from '../../../components/treeList/treeList.component';
import { ROW_ACTIONS } from '../../teamspaces.contants';
import { MyTeamspaceItem } from '../myTeamspaceItem/myTeamspaceItem.component';
import { TooltipButton } from '../tooltipButton/tooltipButton.component';

import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue, renderWhenTrueOtherwise } from '../../../../helpers/rendering';
import { Avatar, OwnerData } from './teamspaceItem.styles';

interface IProps {
	name: string;
	firstName: string;
	lastName: string;
	projects: any[];
	active: boolean;
	hasAvatar: boolean;
	isMyTeamspace: boolean;
	disabled: boolean;
	permissions: any[];
	onToggle: (state) => void;
	onAddProject: (event, teamspaceName) => void;
}

const getMemoizedAvatarUrl = memoize(getAvatarUrl);

export const TeamspaceItem = (props: IProps) => {
	const {
		name,
		projects,
		onToggle,
		active,
		isMyTeamspace,
		onAddProject,
		permissions,
		disabled,
		firstName,
		lastName,
		hasAvatar,
	} = props;

	const avatarUrl = getMemoizedAvatarUrl(name);
	const teamspaceInitials = name.split(' ').slice(0, 2).map((text) => text[0]).join('').trim().toUpperCase();

	const handleAddNewProject = (event) => onAddProject(event, name);

	const renderActions = () => renderWhenTrue(() => (
		<TooltipButton
			{...ROW_ACTIONS.ADD_NEW}
			label="Add new project"
			action={handleAddNewProject}
		/>
	))(hasPermissions('create_project', permissions)) as any;

	const handleClick = () => {
		onToggle({ id: name, nested: projects });
	};

	const renderAvatar = () => renderWhenTrueOtherwise(
		() => <Avatar src={avatarUrl} size="35" />,
		() => <Avatar size="35">{teamspaceInitials}</Avatar>
	)(hasAvatar);

	return (
		<TreeList
			name={name}
			disabled={disabled}
			level={TREE_LEVELS.TEAMSPACE}
			onClick={handleClick}
			active={active}
			renderRoot={isMyTeamspace ? MyTeamspaceItem : null}
			IconProps={{ IconClosed: renderAvatar }}
		>
			{renderActions}
		</TreeList>
	);
};
