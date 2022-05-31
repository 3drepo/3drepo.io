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

import { LatestRevision } from '@/v5/ui/routes/dashboard/projects/containers/containersList/latestRevision';
import { Name as RevisionStatus } from '@/v5/ui/routes/dashboard/projects/containers/containersList/latestRevision/revisionStatus/revisionStatus.styles';
import styled from 'styled-components';

export const Container = styled.div`
	display: flex;
	flex-direction: column;
	color: ${({ theme }) => theme.palette.secondary.main};
	width: 100%;
	align-items: baseline;
	padding: 12px;

	&:hover, &:focus {
		background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	}
`;

export const LastRevision = styled(LatestRevision)`
	&, ${RevisionStatus} {
		color: ${({ theme }) => theme.palette.base.main};
	}
`;

export const ErrorText = styled.div`
	color: ${({ theme }) => theme.palette.error.main};
`;
