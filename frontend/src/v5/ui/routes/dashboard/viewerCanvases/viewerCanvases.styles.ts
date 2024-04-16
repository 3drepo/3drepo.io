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

import { PropsWithChildren } from 'react';
import BaseSplitPane, { SplitPaneProps } from 'react-split-pane';
import styled from 'styled-components';

export const SplitPane = styled(BaseSplitPane)<PropsWithChildren<SplitPaneProps>>`
	.Resizer {
		box-sizing: border-box;
		background-clip: padding-box;
		z-index: 1;
		&.vertical {
			background-color: ${({ theme }) => theme.palette.base.light};
			width: 24px;
			margin: 0 -12px;
			cursor: col-resize;
			border-left: 12px solid transparent;
			border-right: 11px solid transparent;
		}
	}
`;

export const PaneNodule = styled.div`
	width: 24px;
	height: 40px;
	background-color: ${({ theme }) => theme.palette.base.light};
	border-radius: 4px;
	display: block;
	color: ${({ theme }) => theme.palette.primary.contrast};
	position: relative;
	top: 85%;
	left: -12px;
	z-index: 1;
	align-content: center;
	text-align: center;
	&:hover {
		background-color: ${({ theme }) => theme.palette.tertiary.light};
	}
	&:active {
		background-color: ${({ theme }) => theme.palette.tertiary.mid};
	}
`;
