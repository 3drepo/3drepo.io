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

import styled, {css} from 'styled-components';

const commonStyles = css`
	font-family: 'Arial', sans-serif;
	line-height: 1;
`;

export const Textarea = styled.textarea`
	${commonStyles};
	background: none;
	position: absolute;
	border: none;
	padding: 0;
	margin: 0;
	resize: none;
	outline: none;
	overflow: hidden;
	transform-origin: left top;
	z-index: 3;

	&:focus {
		outline: none;
	}
`;

export const AssistantElement = styled.pre`
	${commonStyles};
	display: inline;
	position: absolute;
	visibility: hidden;
	margin: 0;
`;

export const GhostElement = styled.pre`
	${commonStyles};
	display: inline;
	font-size: 14px;
	line-height: 16.625px;
	font-family: inherit;
	position: absolute;
	visibility: hidden;
	margin: 0;
	padding-right: 56px;
	white-space: pre-wrap;
`;
