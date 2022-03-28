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
import EmailIconBase from '@assets/icons/twoToned/email-two_toned.svg';
import { Link as LinkBase } from 'react-router-dom';

export const Body = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 454px;
	border-radius: 6px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	margin: 28px;
	padding: 45px 60px;
	text-align: center;
`;

export const EmailIcon = styled(EmailIconBase)`
    transform: scale(1.5);
`;

export const Subtitle = styled.div`
	${({ theme }) => theme.typography.h2};
	color: ${({ theme }) => theme.palette.secondary.main};
	margin-top: 35px;
`;

export const ActionMessage = styled.div`
	${({ theme }) => theme.typography.h4};
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: 500;
	margin-top: 20px;
	display: inline-block;
`;

export const EmailAddress = styled(ActionMessage)`
	font-weight: 700;
	margin-top: 0;
`;

export const InfoMessage = styled.div`
	${({ theme }) => theme.typography.h5};
	color: ${({ theme }) => theme.palette.base.main};
	font-weight: 400;
	margin-top: 20px;
	display: inline-block;
`;

export const HelpMessage = styled.div`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.base.main};
	font-weight: 500;
	margin-top: 20px;
`;

export const Link = styled(LinkBase).attrs({
	target: '_blank',
})`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.base.main};
	font-weight: 500;
	text-underline-offset: 1px;
	text-decoration-thickness: .11em;
`;
