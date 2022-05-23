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
import { AuthTemplate as AuthTemplateBase } from '@components/authTemplate';
import { LoginLink } from '@components/authTemplate/authTemplate.styles';

export const AuthTemplate = styled(AuthTemplateBase)`
	font-family: ${({ theme }) => theme.typography.fontFamily};
`;

export const Title = styled.div`
	${({ theme }) => theme.typography.h1};
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: 600;
`;

export const Message = styled.div`
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.base.main};
	margin-top: 25px;
`;

export const BackToLogin = styled(LoginLink)`
	display: block;
	margin: 35px auto 10px;
	text-align: center;
	&& {
		color: ${({ theme }) => theme.palette.primary.main};
	}
`;
