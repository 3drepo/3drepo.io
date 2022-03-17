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

import styled from 'styled-components';
import UserIcon from '@assets/icons/user.svg';
import PasswordIcon from '@assets/icons/lock.svg';
import LoginIcon from '@assets/icons/login.svg';
import { FormTextField } from '@controls/formTextField/formTextField.component';
import { Typography } from '@controls/typography';
import { Button } from '@controls/button';

export const Heading = styled(Typography).attrs({
	variant: 'h1',
})`
	color: ${({ theme }) => theme.palette.secondary.main};
	user-select: none;
`;

export const LoginField = styled(FormTextField).attrs({
	required: true,

})`
	>* { color: ${({ theme }) => theme.palette.secondary.main}; }
`;

export const UsernameField = styled(LoginField).attrs({
	InputProps: {
		startAdornment: <UserIcon />,
	},
})``;

export const PasswordField = styled(LoginField).attrs({
	InputProps: {
		startAdornment: <PasswordIcon />,
	},
})``;

export const OtherOptions = styled.div`
	display: flex;
	padding: 14px 0;
	color: ${({ theme }) => theme.palette.base.main};
	a {
		color: ${({ theme }) => theme.palette.primary.main};
	}
`;

export const SignUp = styled(Typography).attrs({
	variant: 'body1',
})`
`;

export const ForgotPassword = styled(Typography).attrs({
	variant: 'body1',
})`
	margin-left: auto;
`;

export const LoginButton = styled(Button).attrs({
	type: 'submit',
	variant: 'contained',
	color: 'primary',
	fullWidth: true,
	startIcon: <LoginIcon />,
})`
	margin: 20px 0;
`;
