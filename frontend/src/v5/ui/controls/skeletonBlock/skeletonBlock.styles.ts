/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { Skeleton } from '@mui/material';
import styled from 'styled-components';

export const SkeletonBlock = styled(Skeleton)<{ delay?: number }>`
	overflow: hidden;
	position: relative;
	animation-delay: ${({ delay }) => `${delay || 0}s`};
`;

export const ButtonSkeleton = styled(SkeletonBlock)`
	height: 50px;
	width: calc(100% - 20px);
`;
