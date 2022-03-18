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
import { Typography } from '@mui/material';
import { Button } from '@controls/button';

export const Title = styled(Button).attrs({
	variant: 'text',
})<{ selected?: boolean }>`
	${({ theme }) => theme.typography.h5};

	color: ${({ theme }) => theme.palette.secondary.main};
	padding: 0;
	margin: 0;
	max-width: 100%;
    justify-content: flex-start;

	${({ theme, selected }) => selected && css`
		color: ${theme.palette.primary.contrast};
	`}

	& span {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}
`;

export const Subtitle = styled(Typography).attrs({
	variant: 'body1',
	component: 'span',
})<{ selected?: boolean }>`
	white-space: nowrap;
	display: block;
	color: ${({ theme }) => theme.palette.base.main};

	${({ theme, selected }) => selected && css`
		color: ${theme.palette.base.light};
	`}
`;

export const Container = styled.div`
	min-width: 0;
	display: block;
	overflow: hidden;
`;
