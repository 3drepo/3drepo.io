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
import { TextField } from '@controls/inputs/textField/textField.component';
import { Typography } from '@controls/typography';
import UserIcon from '@assets/icons/user.svg';
import PasswordIcon from '@assets/icons/lock.svg';
import styled, { css } from 'styled-components';
import { ErrorMessage as ErrorMessageBase } from '@controls/errorMessage/errorMessage.component';
import { PasswordField as PasswordFieldBase } from '@controls/inputs/passwordField/passwordField.component';

export const AuthHeading = styled(Typography).attrs({
	variant: 'h1',
})`
	color: ${({ theme }) => theme.palette.secondary.main};
	user-select: none;
	margin-bottom: 22px;
`;

const authFieldStyles = css`
	margin-top: 8px;
	margin-bottom: 14px;
	>* { color: ${({ theme }) => theme.palette.secondary.main}; }
`;

export const UsernameField = styled(TextField).attrs({
	InputProps: {
		startAdornment: <UserIcon />,
	},
	label: formatMessage({
		id: 'auth.login.usernameLabel',
		defaultMessage: 'Username or email',
	}),
	autoComplete: 'login',
})`
	${authFieldStyles}
`;

export const PasswordField = styled(PasswordFieldBase).attrs({
	InputProps: {
		startAdornment: <PasswordIcon />,
	},
	autoComplete: 'current-password',
})`
	${authFieldStyles}
`;

export const ErrorMessage = styled(ErrorMessageBase)`
	margin-top: 5px;
`;

export const AuthParagraph = styled.div`
	margin: 22px 0;
	color: ${({ theme }) => theme.palette.base.main};
`;

export const ReturnLinkContainer = styled.div`
	color: ${({ theme }) => theme.palette.primary.main};
	text-decoration: none;
	height: 15px;
	&:hover, &:visited {
		color: ${({ theme }) => theme.palette.primary.main};
	}
`;
