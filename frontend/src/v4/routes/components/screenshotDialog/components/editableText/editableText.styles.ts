/**
 *  Copyright (C) 2019 3D Repo Ltd
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

export const TextBox = styled.div<{ $placeholder: string }>`
	font-family: 'Arial', sans-serif;
	line-height: 1;
	position: absolute;
	padding: 0;
	margin: 0;
	transform-origin: left top;
	z-index: 3;
	display: inline-block;
	white-space: pre-wrap;
	overflow-wrap: break-word;
	cursor: text;
	overflow: hidden;
    position: sticky;
    bottom: 0;

	&:focus {
		outline: none;
	}

	&:empty::before {
		content: "${({ $placeholder }) => $placeholder}";
		color: ${({ theme }) => theme.palette.base.light};
	}
`;
