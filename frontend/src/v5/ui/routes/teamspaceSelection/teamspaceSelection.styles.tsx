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

import { Typography } from '@controls/typography';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { DashboardScroll } from '../dashboard/projects/projects.styles';

const WELCOME_TEXT_MARGIN = 50;
const NAVBAR_AND_FOOTER_HEIGHT = 104;

export const ScrollBar = styled(DashboardScroll).attrs({
	variant: 'secondary',
})`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
`;

export const Content = styled.div`
	min-height: calc(100vh - ${NAVBAR_AND_FOOTER_HEIGHT}px);
    align-content: center;
    flex-flow: column;
	display: flex;
    flex-wrap: wrap;
	justify-content: center;
	padding: 50px;
	box-sizing: border-box;
`;

export const FadeMessageTrigger = styled.div`
	height: 1px;
	margin-top: -${WELCOME_TEXT_MARGIN}px;
    margin-bottom: ${2 * WELCOME_TEXT_MARGIN}px;
`;

export const WelcomeMessage = styled(Typography).attrs({
	variant: 'h1',
})<{ $visible: boolean; }>`
	color: ${({ theme }) => theme.palette.secondary.main};
	text-align: center;
	transition: opacity 0.5s ease-out;
	opacity: ${({ $visible }) => ($visible ? 1 : 0)};
	transform: translateY(${WELCOME_TEXT_MARGIN}px);
	pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
	user-select: none;
`;

export const PricingLink = styled(Link).attrs({
	target: '_blank',
})`
	${({ theme }) => theme.typography.link};
	display: block;
	margin-top: 3px;
`;
