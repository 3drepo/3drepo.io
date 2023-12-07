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

export const Section = styled.div`
	display: inherit;
	overflow: hidden;
`;

export const Container = styled.div`
	background-color: ${({ theme }) => theme.palette.secondary.mid};
	transition: all .3s;
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