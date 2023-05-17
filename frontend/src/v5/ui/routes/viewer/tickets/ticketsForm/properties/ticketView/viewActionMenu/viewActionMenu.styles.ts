/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { MenuItem } from '@controls/ellipsisMenu/ellipsisMenuItem/ellipsisMenuItem.styles';

export const Container = styled.div`
	line-height: 20px;
	font-weight: 500;
	font-size: 12px;
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	border-radius: 5px;
	display: grid;
	align-items: center;
	grid-template-columns: 1fr auto;
	box-sizing: border-box;
	height: 36px;

	${MenuItem} {
		margin-left: auto;
	}
`;

export const TitleContainer = styled.div<{ disabled?: boolean }>`
	padding-left: 11px;
	display: flex;
	align-items: center;
	${({ disabled, theme }) => (disabled ? css`
		pointer-events: none;
		color: ${theme.palette.base.light};
	` : css`
		cursor: pointer;
		color: ${theme.palette.secondary.main};
	`)}

	& > svg {
		margin-right: 4px;
		width: 13px;
		height: 13px;
	}
`;
