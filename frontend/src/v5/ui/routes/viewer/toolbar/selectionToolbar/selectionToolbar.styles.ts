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
import PlusIcon from '@assets/icons/viewer/plus.svg';

export const Section = styled.div`
	display: inherit;
`;

export const Container = styled.div`
	background-color: ${({ theme }) => theme.palette.secondary.mid};
	width: fit-content;
	padding-left: 31px;
	margin-left: -45px;

	&:has(> ${/* sc-selector */Section}:not([hidden])) {
		padding-left: 45px;
	}

	& > ${/* sc-selector */Section}:not([hidden]) ~ ${/* sc-selector */Section}:not([hidden]) {
		border-left: solid 1px ${({ theme }) => theme.palette.base.light};
	}
`;

export const ClearIcon = styled(PlusIcon)`
	transform: rotate(45deg);
`;

export const ClearButton = styled.div`
	cursor: pointer;
	height: 30px;
	border-radius: 19px;
	color: ${({ theme }) => theme.palette.primary.lightest};
	background-color: ${({ theme }) => theme.palette.secondary.light};
	align-self: center;
	overflow: hidden;
	display: flex;
	flex-direction: row;
	place-items: center;
	gap: 6px;
	padding: 11px;
	box-sizing: border-box;
	white-space: nowrap;
	transition: all .3s;

	&[hidden] {
		width: 0;
		padding: 0;
	}

	&:not([hidden]) {
		width: fit-content;
	}

	&:hover {
		color: ${({ theme }) => theme.palette.primary.main};
	}
`;
