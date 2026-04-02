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
import { SplitPane as BaseSplitPane, SplitPaneProps } from 'react-split-pane';
import ResizePaneIcon from '@assets/icons/outlined/horizontal_resize-outlined.svg';
import styled, { css } from 'styled-components';
import { ComponentToString } from '@/v5/helpers/react.helper';

export const SplitPane = styled(BaseSplitPane)<PropsWithChildren<SplitPaneProps> & { $isCalibrating?: boolean, $is2DOpen?: boolean }>`
	height: calc(100vh - ${({ $isCalibrating }) => $isCalibrating ? 120 : 62}px) !important;
	position: absolute !important;

	& .split-pane-divider.horizontal {
		background-color: ${({ theme }) => theme.palette.base.light};
    	width: 26px !important;
		margin: 0 -12px !important;
		border-left: 12px solid transparent;
		border-right: 12px solid transparent;
		flex-shrink: 0;
		cursor: pointer;
		background-clip: padding-box;
		z-index: 1;

		&:hover {
			background-color: ${({ theme }) => theme.palette.tertiary.light};
		}
		&:active {
			background-color: ${({ theme }) => theme.palette.tertiary.mid};
		}

		/* Panel resizer nodule */
		:is(&:hover, &:active)::after {
			content: url('data:image/svg+xml;utf8,${ComponentToString(ResizePaneIcon)}');
			padding-top: 3px;
			height: 40px;
			width: 24px;
			border-radius: 4px;
			background-color: inherit;
			box-sizing: border-box;
			position: absolute;
			bottom: 112px;
			align-content: center;
			text-align: center;
			transform: translate(-50%, -50%);
		}
	}

	${({ $is2DOpen }) => !$is2DOpen && css`
		.Resizer {
			display: none;
		}
		.Pane1 {
			max-width: 100%;
		}
	`}
`;
