/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { AvatarButton } from '@controls/avatarButton';
import { AvatarWrapper, Container, Company, Job, Name, UserData } from './userPopover.styles';

export interface IUser {
	user: string;
	fullName: string;
	company?: string;
	job?: string
}

interface IUserPopover {
	user: IUser;
}

const getInitials = (name) => name.split(' ').slice(0, 2).map((text) => text[0]).join('')
	.trim()
	.toUpperCase();

export const UserPopover = ({ user: { fullName, company, job } }: IUserPopover) => (
	<Container>
		<AvatarWrapper>
			<AvatarButton>{getInitials(fullName)}</AvatarButton>
		</AvatarWrapper>
		<UserData>
			<Name>{fullName}</Name>
			<Company>{company}</Company>
			<Job>{job}</Job>
		</UserData>
	</Container>
);
