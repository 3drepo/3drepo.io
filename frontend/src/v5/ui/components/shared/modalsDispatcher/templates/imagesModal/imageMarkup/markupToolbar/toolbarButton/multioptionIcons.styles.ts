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
import { ToolbarSelectItem } from '@controls/toolbarSelect/toolbarSelectItem/toolbarSelectItem.component';

export const FloatingBar = styled.div`
	box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	margin-bottom: 5px;
	box-sizing: border-box;
	border: solid 1px ${({ theme }) => theme.palette.secondary.lightest};
	border-radius: 20px;
	width: 40px;
	display: flex;
	flex-direction: column;
	padding: 10px 0;
	cursor: inherit;
`;

export const FlatToolbarSelectItem = styled(ToolbarSelectItem)`
	cursor: pointer;
	width: 100%;
	height: 19px;
	font-weight: 500;
	display: grid;
	place-content: center;
	box-shadow: none;
	margin-bottom: unset;
	border: none;

	&:hover {
		color: ${({ theme }) => theme.palette.primary.main};
	}
`;

export const IconWithFooterContainer = styled.div<{ $footer, $expanded?: boolean }> `
	position: relative;
	height: 40px;
	width: 40px;
	padding: 0 10px;
	box-sizing: border-box;
	cursor: pointer;
	display: grid;
	place-content: center;
	border-radius: 50%;

	svg {
		width: 100%;
	}

	&:hover {
		color: ${({ theme }) => theme.palette.primary.main};
	}
	${({ $expanded }) => $expanded && css`
		color: ${({ theme }) => theme.palette.primary.main};
	`}

	&::after {
		content: "${({ $footer }) => $footer}";
		font-size: 10px;
		font-weight: 600;
		position: absolute;
		bottom: 8px;
		left: 24px;
		height: 10px;
		line-height: 10px;
		background-color: ${({ theme }) => theme.palette.primary.contrast};
		padding: 0 2px;
	}
`;

