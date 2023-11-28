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
import { Container } from '../baseIcon.styles';
import { BaseIcon } from '../baseIcon.component';

export const MultiOptionIconContainer = styled.div`
	position: relative;

	& > ${Container}::after {
		content: '';
		position: absolute;
		background-image: linear-gradient(to top right, transparent 50%, ${({ theme }) => theme.palette.base.main} 0);
		height: 6px;
		width: 6px;
		top: 6px;
		right: 6px;
	}

	&:hover > ${Container}::after {
		background-image: linear-gradient(to top right, transparent 50%, ${({ theme }) => theme.palette.primary.contrast} 0);
	}
`;

export const FloatingIconsContainer = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
	bottom: 40px;
`;

export const FloatingIcon = styled(BaseIcon)`
	border-radius: 50%;
	box-shadow: 0px 2px 7px 0px #00000026;
	background-color: ${({ theme }) => theme.palette.secondary.main};
	margin-bottom: 10px;
`;