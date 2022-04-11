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
import { Link as LinkBase } from 'react-router-dom';
import { Button } from '@controls/button';
import DividerBase from '@mui/material/Divider';
import { Content, Logo as LogoBase } from '../userSignup.styles';

export const Container = styled.div`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

export const Logo = styled(LogoBase)`
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const VerificationBox = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

export const Body = styled.div`
	text-align: left;
	padding: 60px;
	${Content}
	margin: 60px 0 30px;
`;

export const Title = styled.div`
	${({ theme }) => theme.typography.h1};
	color: ${({ theme }) => theme.palette.secondary.main};
`;

export const InfoMessage = styled.div`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.base.main};
	font-family: ${({ theme }) => theme.typography.fontFamily};
	font-weight: 400;
	line-height: 14.52px;
	font-size: 11px;
	margin-top: 15px;
	display: inline-block;
`;

export const Subtitle = styled(InfoMessage)`
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: 600;
	margin-top: 25px;
`;

export const VerificationButton = styled(Button).attrs({
	variant: 'contained',
	color: 'primary',
})`
	margin: 15px 0;
`;

export const Divider = styled(DividerBase)`
	margin: 15px 0;
`;

export const GreetingsMessage = styled(InfoMessage)`
	margin-top: 20px;
	display: block;
`;

export const GreetingsAuthor = styled(GreetingsMessage)`
	font-weight: 600;
`;

export const Link = styled(LinkBase).attrs({
	target: '_blank',
})`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.base.main};
	font-size: inherit;
	font-weight: inherit;
	text-underline-offset: 1px;
	/* stylelint-disable-next-line */
	text-decoration-thickness: .11em;
`;

export const EmailLink = styled(Link).attrs({
	as: 'a',
	href: 'mailto:support@3drepo.org',
})``;

// Footer
export const Footer = styled.div`
	text-align: center;
`;

export const SocialIconsContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	margin-bottom: 27px;
`;

export const SocialIcon = styled(LinkBase).attrs({
	target: '_blank',
})`
	cursor: pointer;
	background-color: ${({ theme }) => theme.palette.base.lightest};
	color: ${({ theme }) => theme.palette.primary.contrast};
	border-radius: 50%;
	width: 38px;
	height: 38px;
	margin: 0 5px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const FooterText = styled.div`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.base.light};
	margin-top: 10px;
	line-height: .7rem;
`;
