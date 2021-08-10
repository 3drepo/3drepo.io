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

import React from 'react';

import { History } from 'history';
import { memoize } from 'lodash';

import { ROUTES } from '../../../../constants/routes';
import { getAvatarUrl } from '../../../../services/api';
import { ROW_ACTIONS } from '../../teamspaces.contants';
import { MyTeamspaceItem } from '../myTeamspaceItem/myTeamspaceItem.component';
import { TooltipButton } from '../tooltipButton/tooltipButton.component';

import { encodeElementId } from '../../../../helpers/html';
import { hasPermissions } from '../../../../helpers/permissions';
import { renderWhenTrue, renderWhenTrueOtherwise } from '../../../../helpers/rendering';
import { Avatar, Container } from './teamspaceItem.styles';

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
	showStarredOnly: boolean;
	onToggle: (state) => void;
	onAddProject: (event, teamspaceName) => void;
	onLeaveTeamspace: (event) => void;
	history: History;
	account: string;
}

const getMemoizedAvatarUrl = memoize(getAvatarUrl);

export const TeamspaceItem = ({ name, projects, onToggle, active, isMyTeamspace, onAddProject, permissions,
	disabled, hasAvatar, onLeaveTeamspace, history, account, ...props}: IProps) => {

	const avatarUrl = getMemoizedAvatarUrl(name);

	const teamspaceInitials = name.split(' ').slice(0, 2).map((text) => text[0]).join('').trim().toUpperCase();

	const handleAddNewProject = (event) => onAddProject(event, name);

	const handleGoToTeamspaceSetting = (event) => {
		event.preventDefault();
		history.push(`${ROUTES.TEAMSPACES}/${account}/`);
	};

	const RenderNewProjectAction = () => renderWhenTrue(() => (
		<TooltipButton
			{...ROW_ACTIONS.ADD_NEW}
			label="Add new project"
			action={handleAddNewProject}
		/>
	))(hasPermissions('create_project', permissions)) as any;

	const RenderGoToTeamspaceSettingsAction = () => renderWhenTrue(() => (
		<TooltipButton
			{...ROW_ACTIONS.SETTINGS}
			label="Settings"
			action={handleGoToTeamspaceSetting}
		/>
	))(hasPermissions('teamspace_admin', permissions)) as any;

	const RenderLeaveAction = () => renderWhenTrue(() => (
		<TooltipButton
			{...ROW_ACTIONS.LEAVE}
			label="Leave teamspace"
			action={onLeaveTeamspace}
		/>
	))(!isMyTeamspace) as any;

	const handleClick = () => {
		onToggle({ id: name, nested: projects });
	};

	const renderAvatar = () => renderWhenTrueOtherwise(
		() => <Avatar src={avatarUrl} size="50" />,
		() => <Avatar size="50">{teamspaceInitials}</Avatar>
	)(hasAvatar);

	return (
		<Container
			name={name}
			disabled={disabled}
			onClick={handleClick}
			active={active}
			renderRoot={isMyTeamspace ? MyTeamspaceItem : null}
			IconProps={{ IconClosed: renderAvatar }}
			showStarredOnly={props.showStarredOnly}
			id={'teamspace-' + encodeElementId(name)}
		>
		{() => (
			<>
				<RenderGoToTeamspaceSettingsAction />
				<RenderNewProjectAction />
				<RenderLeaveAction />
			</>
		)}
		</Container>
	);
};
