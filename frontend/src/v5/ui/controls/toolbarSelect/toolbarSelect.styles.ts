/**
 *  Copyright (C) 2024 3D Repo Ltd
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

export const FloatingButtonsContainer = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
	bottom: 44px;
	z-index: 16;
`;

export const subMenuIndicatorStyles = css<{ $expanded?: boolean }>`
	content: '';
	position: absolute;
	height: 0;
	width: 0;
	top: 6px;
	right: 6px;
	color: ${({ theme }) => theme.palette.base.main};
	border: solid 3px currentColor;
	${({ $expanded, theme }) => $expanded && css`
		border-color: ${theme.palette.primary.main};
	`}
	border-left-color: transparent;
	border-bottom-color: transparent;
`;

export const Container = styled.div<{ disabled?: boolean; $expanded?: boolean }>`
	position: relative;

	&::after {
		${subMenuIndicatorStyles}
	}
`;
