/**
 *  Copyright (C) 2022 3D Repo Ltd
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

export const Container = styled.div`
	width: fit-content;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	user-select: none;
	${({ theme }) => theme.typography.h5};
	font-weight: 600;
	font-size: 14px;
`;

export const FlexContainer = styled.div<{ '$selectedrow': boolean; error?: string }>`
	max-width: 100%;
	color: ${({ $selectedrow, error, theme }) => {
		if (error) return theme.palette.error.main;
		return $selectedrow ? theme.palette.primary.contrast : theme.palette.secondary.main;
	}};
	user-select: none;
	align-items: center;
	display: flex;
`;

export const Filename = styled.span`
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;
`;

export const Filesize = styled.div`
	color: ${({ theme }) => theme.palette.base.main};
	font-size: 12px;
`;
