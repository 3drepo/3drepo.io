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

import styled from 'styled-components';
import InfoIconBase from '@assets/icons/viewer/info.svg';

export const Container = styled.div`
	position: absolute;
	z-index: 1;
	width: 100%;
	margin-top: 20px;
	pointer-events: none;

	& > * {
		pointer-events: all;
	}
`;

export const Box = styled.div`
	min-height: 68px;
	width: min(424px, 100%);
	max-width: 600px;
	margin: auto;
	box-sizing: border-box;
	padding: 9px 16px;
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	color: ${({ theme }) => theme.palette.secondary.main};
	border: solid 1px ${({ theme }) => theme.palette.tertiary.mid};
	border-radius: 10px;
	display: grid;
	grid-template-columns: 28px 1fr;
	row-gap: 5px;
	column-gap: 6px;
	place-items: center;
	cursor: default;
`;

export const InfoIcon = styled(InfoIconBase)`
	color: ${({ theme }) => theme.palette.tertiary.light};
`;

export const TitleBar = styled.div`
	display: flex;
	justify-content: space-between;
	width: 100%;
	${({ theme }) => theme.typography.h3};
`;

export const CloseIconContainer = styled.div`
	cursor: pointer;
`;

export const Description = styled.div`
	${({ theme }) => theme.typography.body1};
	width: 100%;
`;
