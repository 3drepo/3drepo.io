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

import { formatMessage } from '@/v5/services/intl';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { Typography } from '@controls/typography';
import { Link } from 'react-router-dom';
import UserIcon from '@assets/icons/user.svg';
import PasswordIcon from '@assets/icons/lock.svg';
import styled from 'styled-components';

export const AuthHeading = styled(Typography).attrs({
	variant: 'h1',
})`
	color: ${({ theme }) => theme.palette.secondary.main};
	user-select: none;
`;

export const AuthField = styled(FormTextField).attrs({
	required: true,

})`
	margin-bottom: 5px;
	>* { color: ${({ theme }) => theme.palette.secondary.main}; }
`;

export const UsernameField = styled(AuthField).attrs({
	InputProps: {
		startAdornment: <UserIcon />,
	},
	name: 'username',
	label: formatMessage({
		id: 'auth.login.usernameLabel',
		defaultMessage: 'Username or email',
	}),
	autoComplete: 'login',
})``;

export const PasswordField = styled(AuthField).attrs({
	InputProps: {
		startAdornment: <PasswordIcon />,
	},
	autoComplete: 'current-password',
	type: 'password',
})``;

export const ErrorMessage = styled(Typography)`
	color: ${({ theme }) => theme.palette.error.main};
	display: flex;
	align-items: center;
	margin-top: 15px;
	svg {
		margin-right: 5px;
	}
`;

export const AuthParagraph = styled.div`
	margin: 22px 0;
	color: ${({ theme }) => theme.palette.base.main};
`;

export const CenteredLink = styled(Link)`
	display: flex;
	margin: 15px auto 12px;
	justify-content: center;
	color: ${({ theme }) => theme.palette.primary.main};
`;
