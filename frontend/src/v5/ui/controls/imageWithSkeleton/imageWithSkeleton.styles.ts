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

import styled, { css } from 'styled-components';
import { Skeleton } from '@mui/material';
import { AuthImg } from '@components/authenticatedResource/authImg.component';

export const Image = styled(AuthImg)<{ $isLoading: boolean }>`
	${({ $isLoading }) => $isLoading && css`
		display: none;
	`}
`;

export const SkeletonImage = styled(Skeleton).attrs({
	variant: 'rectangular',
})<{ $variant: 'primary' | 'secondary' }>`
	height: 100%;
	background-color: ${({ theme: { palette }, $variant }) => (
		$variant === 'primary' ? palette.base.lighter : palette.secondary.light
	)};
`;
