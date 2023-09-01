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

export const Container = styled.div`
	min-width: 70px;
	position: absolute;
	right: 60px;
`;

const activeStyles = css`
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	color: ${({ theme }) => theme.palette.primary.main};
`;

const voidStyles = css`
	color: ${({ theme }) => theme.palette.primary.contrast};
	border: 1px solid ${({ theme }) => theme.palette.primary.contrast};
	background-color: transparent;
`;

export const Button = styled(LabelButton)<{ $isVoid: boolean }>`
	margin: 0;
	height: 26px;
	width: 100%;
	${activeStyles}
	
	&:hover {
		${voidStyles}
	}
	
	${({ $isVoid }) => $isVoid && css`
		${voidStyles}
		&:hover {
			${activeStyles}
		}
	`};
`;
