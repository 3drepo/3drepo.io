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
import { LabelButton } from '@controls/button';
import { hexToOpacity } from '@/v5/ui/themes/theme';

export const Container = styled.div`
	min-width: 70px;
	position: absolute;
	right: 60px;
`;

export const Button = styled(LabelButton)<{ $isVoid: boolean }>`
	margin: 0;
	height: 26px;
	width: 100%;
	color: ${({ theme }) => theme.palette.primary.main};

	&:hover {
		border-color: ${({ theme }) => hexToOpacity(theme.palette.primary.contrast, 50)};
		color: ${({ theme }) => theme.palette.primary.main};
	}

	${({ theme, $isVoid }) => $isVoid && css`
		color: ${theme.palette.primary.contrast};
		background-color: transparent;
		border: 1px solid currentColor;
	`};
`;
