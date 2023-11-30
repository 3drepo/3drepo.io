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
import { Container } from '../toolbarButton.styles';
import { ToolbarButton } from '../toolbarButton.component';

export const ButtonOptionsContainer = styled.div`
	position: relative;

	& > ${/* sc-selector */Container}::after {
		content: '';
		position: absolute;
		height: 0;
		width: 0;
		top: 6px;
		right: 6px;
		transition: .2s all;
		border: solid 3px ${({ theme }) => theme.palette.base.main};
	}

	&:hover > ${/* sc-selector */Container}::after {
		border-color: ${({ theme }) => theme.palette.primary.contrast};
	}

	:is(&, &:hover) > ${/* sc-selector */Container}::after {
		border-left-color: transparent;
		border-bottom-color: transparent;
	}
`;

export const FloatingButtonsContainer = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
	bottom: 40px;
`;

export const FloatingButton = styled(ToolbarButton)`
	border-radius: 50%;
	box-shadow: ${({ theme }) => theme.palette.shadows.level_5};
	background-color: ${({ theme }) => theme.palette.secondary.main};
	margin-bottom: 10px;
`;