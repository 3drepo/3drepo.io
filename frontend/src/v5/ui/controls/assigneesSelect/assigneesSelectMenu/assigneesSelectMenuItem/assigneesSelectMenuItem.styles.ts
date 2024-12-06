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

import { Checkbox as BaseCheckbox, MenuItem } from '@mui/material';
import styled, { css } from 'styled-components';

export const ListItemContainer = styled(MenuItem)<{ $error?: boolean }>`
	width: auto;
	height: 44px;
	gap: 7px;
	padding: 6px 12px;
	display: flex;
	align-items: center;
	box-sizing: border-box;
	${({ $error, theme }) => $error && css`
		background-color: ${theme.palette.error.lightest};

		&&&:hover {
			background-color: ${theme.palette.error.light};
		}

		.MuiCheckbox-root:hover {
			background-color: transparent;
		}
	`};
`;

export const Titles = styled.div`
	width: calc(100% - 60px);
	overflow: hidden;
`;

export const Title = styled.div`
	${({ theme }) => theme.typography.body1};
	color: ${({ theme }) => theme.palette.secondary.main};
	line-height: 15px;
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
`;

export const Subtitle = styled(Title)`
	${({ theme }) => theme.typography.body1};
	font-size: 11px;
	color: ${({ theme }) => theme.palette.base.main};
`;

export const Checkbox = styled(BaseCheckbox)`
	position: absolute;
	right: 6px;
`;
