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
import { Button, Popper as PopperBase } from '@material-ui/core';

export const Items = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	flex: 1;
	max-width: calc(100% - 200px);
	
	&:last-child {
		justify-content: flex-end;
		min-width: 152px;
	
		& > *:last-child div {
			margin-right: 0;
		}
	}
`;

export const Popper = styled(PopperBase)`
	z-index: 100;
`;

export const UserMenu = styled.div`
	display: flex;
	flex-direction: column;
	width: 230px;
`;

export const Section = styled.div`
	display: flex;
	flex-direction: column;
	padding: 11px;

	&:not(:last-of-type) {
		border-bottom: 1px solid ${({ theme }) => theme.palette.base.lightest};
	}
`;

export const AvatarSection = styled(Section)`
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

export const EditProfileButton = styled(Button).attrs({
	variant: 'text',
	color: 'primary',
})`
	${({ theme }) => theme.typography.link};
	text-underline-offset: 2px;
`;

export const SignOutButton = styled(Button).attrs({
	variant: 'contained',
	color: 'primary',
})`
	&& {
		margin: 0;
	}
`;
