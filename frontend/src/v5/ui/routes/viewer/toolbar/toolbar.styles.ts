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

import styled from 'styled-components';

export const MainContainer = styled.div`
	border-radius: 24px;
	position: absolute;
	bottom: 35px;
	left: 50%;
	transform: translateX(-50%);
	pointer-events: all;
	z-index: 1;
	display: flex;
	flex-direction: row;

	& > * {
		border: solid 1px ${({ theme }) => theme.palette.secondary.light};
		height: 48px;
		border-radius: 24px;
		padding: 0 10px;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-evenly;
	}
`;

export const AlwaysOnContainer = styled.div`
	background-color: ${({ theme }) => theme.palette.secondary.main};
	z-index: 1;
`;

export const ExpansionBlock = styled.div`
	display: inherit;
	overflow: hidden;
`;

export const ExpansionContainer = styled.div`
	background-color: ${({ theme }) => theme.palette.secondary.mid};
	transition: all .3s;
	width: fit-content;
	padding-left: 31px;
	margin-left: -45px;

	&:has(> ${ExpansionBlock}:not([hidden])) {
		padding-left: 45px;
	}

	& > ${ExpansionBlock}:not([hidden]) ~ ${ExpansionBlock}:not([hidden]) {
		border-left: solid 1px ${({ theme }) => theme.palette.base.light};
	}
`;
