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

import { TextOverflow } from '@controls/textOverflow';
import styled from 'styled-components';

export const BaseInfoContainer = styled.div`
	min-width: 0;
	gap: 5px;
    display: flex;
    flex-flow: column;
`;

export const Id = styled.div`
	color: ${({ theme }) => theme.palette.base.main};
	${({ theme }) => theme.typography.caption}
	line-height: 10px;
`;

export const Title = styled(TextOverflow)`
	color: ${({ theme }) => theme.palette.secondary.main};
	font-weight: 500;
	font-size: 12px;
	line-height: 12px;
	height: 12px;
	min-height: 12px;
	padding: 3px 0;
	width: fit-content;
	max-width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	flex-grow: 0;
`;


// TODO - fix after new palette is released
export const Description = styled(TextOverflow).attrs({
	lines: 2,
})`
	${({ theme }) => theme.typography.label};
	line-height: 11px;
	color: #20232A;
`;
