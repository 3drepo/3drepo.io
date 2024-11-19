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

import { Typography } from '@controls/typography';
import styled, { css } from 'styled-components';

export const PaddedContainer = styled.div<{ $collapsed: boolean }>`
	padding: 10px 0;
	box-sizing: border-box;
	transition: max-height .3s;
	max-height: 100%;
	overflow: hidden;
	
	${({ $collapsed }) => $collapsed && css`
		overflow-y: scroll;
		max-height: 50px;
	`}
`;

export const CollapsibleContainer = styled.div`
	height: fit-content;
`;

export const BottomLine = styled.div`
	width: 100%;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
    place-items: center;
    align-items: flex-start;
	padding: 0 10px;
	box-sizing: border-box;
	border-top: 1px solid ${({ theme }) => theme.palette.base.lightest};
`;

export const CollapseButtonContainer = styled.div`
	width: calc(100% - 20px);
	position: relative;
	display: flex;
	justify-content: center;
    grid-column-start: 2;
`;

export const CollapseButton = styled.button`
	border: none;
	cursor: pointer;
	color: ${({ theme }) => theme.palette.primary.contrast};
	background-color: ${({ theme }) => theme.palette.base.main};
	height: 18px;
	border-radius: 0 0 6px 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	justify-self: center;
	gap: 4px;
	font-size: 10px;
	outline: none;
`;

export const ClearButton = styled(Typography).attrs({ variant: 'label' })`
	color: ${({ theme }) => theme.palette.base.main};
	display: flex;
	align-items: center;
	padding: 6px 0 6px 1px;
	cursor: pointer;
    grid-column-start: 3;
    margin-left: auto;

	svg {
		margin-left: 4px;
		border-radius: 50%;
		color: ${({ theme }) => theme.palette.primary.contrast};
		background-color: ${({ theme }) => theme.palette.base.main};
		width: 12px;
		height: 12px;
		box-sizing: border-box;
		padding: 3px;
	}
`;

export const ChevronIconContainer = styled.div<{ $collapsed: boolean }>`
	transform: rotate(180deg);
	transition: all .2s;
	height: 9px;
	${({ $collapsed }) => $collapsed && css`
		transform: rotate(0deg);
	`}
`;
