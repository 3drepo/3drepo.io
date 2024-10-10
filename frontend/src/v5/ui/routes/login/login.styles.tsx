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
import { Typography } from '@controls/typography';
import { UnhandledErrorInterceptor as UnhandledErrorInterceptorBase } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { AuthForm } from '@components/authTemplate/authTemplate.styles';
import { MicrosoftButton as MicrosoftButtonBase } from '@components/shared/sso/microsoftButton.component';

export const OtherOptions = styled.div`
	display: flex;
	padding: 14px 0 14px;
	color: ${({ theme }) => theme.palette.base.main};
	a {
		color: ${({ theme }) => theme.palette.primary.main};
		text-decoration: none;
	}
`;

const StyledTypography = styled(Typography).attrs({
	variant: 'body1',
})``;

export const SignUpPrompt = styled(StyledTypography)`
	margin-right: auto;
`;

export const ForgotPasswordPrompt = styled(StyledTypography)`
	margin-left: auto;
`;

export const UnhandledErrorInterceptor = styled(UnhandledErrorInterceptorBase)`
	margin-top: 5px;
`;

export const AuthFormLogin = styled(AuthForm)`
	min-width: 0;
	width: 489px;
`;

export const MicrosoftButton = styled(MicrosoftButtonBase)`
	width:100%;
`;
