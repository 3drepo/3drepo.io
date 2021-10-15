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

import styled, { css } from 'styled-components';

export const Block = styled.div`
	height: 15px;
	width: ${({ width }) => width}px;
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	overflow: hidden;
	position: relative;
	border-radius: 3px;
	
	${({ widthPercentage }) => widthPercentage && css`
			width: ${widthPercentage}%;
	`};

	::before {
		position: absolute;
		content: "";
		height: 100%;
		width: 100%;
		background-image: ${({ theme }) => `linear-gradient(to bottom, ${theme.palette.tertiary.lightest} 0%, rgba(0, 0, 0, 0.05) 20%, ${theme.palette.tertiary.lightest} 40%, ${theme.palette.tertiary.lightest} 100%)`};
		background-repeat: no-repeat;
		background-size: 450px 400px;
		animation: shimmer 1s linear infinite;
		animation-delay: ${({ delay }) => `${delay}s`};
	}

	@keyframes shimmer {
		0% {
			background-position: 0 -150px;
		}
		100% {
			background-position: 0 150px;
		}
	}
`;
