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

import styled, { css } from 'styled-components';
import { Typography } from '@controls/typography';
import { Display } from '@/v5/ui/themes/media';

export const Container = styled.div`
	${({ isLoading }) => isLoading && css`
		pointer-events: none;
	`}
`;

export const ButtonContainer = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
	width: max-content;
	user-select: none;
`;

export const Title = styled(Typography)`
	white-space: nowrap;
	margin-right: 10px;
`;

export const CollapsedItemContainer = styled.div`
	margin-bottom: 16px;
`;

export const ControlsContainer = styled.div`
	display: flex;
	justify-content: space-between;
`;

export const SideElementContainer = styled.div`
	@media (max-width: ${Display.Tablet}px) {
		padding-left: 25px;
	}
`;
