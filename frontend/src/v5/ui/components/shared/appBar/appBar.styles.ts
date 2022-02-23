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

import styled from 'styled-components';
import { Button } from '@controls/button';
import {
	Link,
	Paper as PaperBase,
	Popper as PopperBase,
} from '@material-ui/core';

export const AvatarContainer = styled.div`
	&& {
		padding: 0;
		margin: 8px 0;
	}
`;

export const Items = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	flex: 1;
	max-width: calc(100% - 200px);
	
	&:last-child {
		justify-content: flex-end;
		min-width: 152px;
	}
`;

export const Popper = styled(PopperBase)`
	&& {
		z-index: 1101;
		margin-top: -2px;
	}
`;

export const Paper = styled(PaperBase)`
	border-radius: 5px;
	box-shadow: 
		0 6px 10px rgb(0 0 0 / 14%),
		0 1px 18px rgb(0 0 0 / 12%),
		0 3px 5px rgb(0 0 0 / 20%);
`;

export const AvatarSection = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

export const UserFullName = styled.div`
	${({ theme }) => theme.typography.h3};
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const UserUserName = styled.div`
	font-size: 12px;
	color: ${({ theme }) => theme.palette.base.main};
`;

export const EditProfileButton = styled(Link)`
	cursor: pointer;
	${({ theme }) => theme.typography.link};
	text-underline-offset: 2px;
	color: ${({ theme }) => theme.palette.primary.main};
	margin: 11px;
`;

export const SignOutButton = styled(Button).attrs({
	variant: 'contained',
	color: 'primary',
})`
	&& {
		width: 100%;
		margin: 0;
	}
`;
