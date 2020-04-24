/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import Tooltip from '@material-ui/core/Tooltip';
import React from 'react';

import { isEmpty, memoize } from 'lodash';
import { renderWhenTrueOtherwise } from '../../../../../../../helpers/rendering';
import { ITeamspace } from '../../../../../../../modules/teamspaces/teamspaces.redux';
import { getAvatarUrl } from '../../../../../../../services/api';
import {
	CompanyName,
	Container,
	FullName,
	TooltipText,
	Username
} from '../../../../../dynamicUsername/dynamicUsername.styles';
import { Avatar } from './userAvatar.styles';

const getMemoizedAvatarUrl = memoize(getAvatarUrl);

const getInitials = (name) => name.split(' ').slice(0, 2).map((text) => text[0]).join('').trim().toUpperCase();

const avatarUrl = (name) => getMemoizedAvatarUrl(name);

interface IProps {
	name: string;
	// teamspace: string;
	// fetchUserDetails: (teamspace, username) => void;
	// userDetails: any;
	// teamspaceDetails: ITeamspace;
	users: any[];
	jobsList: any[];
}

const TooltipContent = ({ user: { firstName, lastName, company, user, job }}) => {
	return (
		<TooltipText>
			<FullName>{lastName}, {firstName}</FullName>
			<FullName>{user}</FullName>
			<CompanyName>{company}</CompanyName>
			<CompanyName>{job}</CompanyName>
		</TooltipText>
	);
};

export const UserAvatar = ({ name, users, jobsList, ...props }: IProps) => {

	const url = avatarUrl(name);
	const currentUser = users.find((user) => user.user === name);
	const currentUserJobColor = currentUser && jobsList.find((job) => job.name === currentUser.job).color;
	const renderTooltipContent = currentUser ? <TooltipContent user={currentUser} /> : '';

	// @TODO use https://material-ui.com/components/popover/#mouse-over-interaction instead of Tooltip

	return (
		<Tooltip title={renderTooltipContent}>
			<div>
				{renderWhenTrueOtherwise(
					() => <Avatar src={url} jobColor={currentUserJobColor} />,
					() => <Avatar jobColor={currentUserJobColor}>{getInitials(name)}</Avatar>
				)(!isEmpty(url))}
			</div>
		</Tooltip>
	);
};
