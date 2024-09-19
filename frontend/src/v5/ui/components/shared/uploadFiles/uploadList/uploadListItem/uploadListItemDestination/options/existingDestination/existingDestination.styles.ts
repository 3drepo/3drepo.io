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

import { Name as RevisionStatus } from '@components/shared/latestRevision/revisionStatus/revisionStatus.styles';
import styled from 'styled-components';

export const ExistingDestinationOption = styled.div`
	display: flex;
	flex-direction: column;
	color: ${({ theme }) => theme.palette.base.main};
	align-items: baseline;
	
	${RevisionStatus} {
		color: ${({ theme }) => theme.palette.base.main};
	}
`;

export const Name = styled.div`
	width: calc(100% - 10px);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const InUseText = styled.div`
	color: ${({ theme }) => theme.palette.error.main};
`;
