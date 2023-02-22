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

export const IssuePropertiesContainer = styled.div`
	border-top: 1px solid ${({ theme }) => theme.palette.secondary.lightest};
	box-shadow: 0 6px 10px rgb(0 0 0 / 4%);
	background-color: ${({ theme }) => theme.palette.primary.contrast};
	height: 50px;
	padding: 10px 15px;
	display: inline-flex;
	align-items: center;
	width: 100%;
	position: sticky;
	top: 0;
	box-sizing: border-box;
	z-index: 1;
`;

export const PropertyColumn = styled.span`
	width: 70px;
`;

export const PropertyTitle = styled.div`
	${({ theme }) => theme.typography.kicker};
	color: ${({ theme }) => theme.palette.base.main};
	padding: 0 7px;
`;

export const ColumnSeparator = styled.div`
	height: 100%;
	border-left: 1px solid ${({ theme }) => theme.palette.secondary.lightest};
	margin: 0 10px;
`;
