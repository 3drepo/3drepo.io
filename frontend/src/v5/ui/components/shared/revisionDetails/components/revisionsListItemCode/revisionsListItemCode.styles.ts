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
import { Typography } from '@material-ui/core';
import { TextOverflow } from '@controls/textOverflow';
import { fadeToLeft } from '@controls/textOverflow/textOverflow.styles';

export const Text = styled(Typography)`
	${({ theme }) => theme.typography.link};
	color: ${({ theme }) => theme.palette.primary.contrast};
	display: inline;
	cursor: pointer;
`;

export const OverflowWrapper = styled(TextOverflow)`
	width: auto;
	&:after {
		${({ $active, $hover, theme }) => css`
			${$active ? fadeToLeft(theme.palette.primary.main) : fadeToLeft(theme.palette.secondary.light)};
			${$hover && fadeToLeft(theme.palette.secondary.main)};
		`}
	}
`;
