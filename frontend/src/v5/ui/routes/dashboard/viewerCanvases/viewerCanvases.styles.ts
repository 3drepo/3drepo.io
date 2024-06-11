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
import ResizePaneIcon from '@assets/icons/outlined/horizontal_resize-outlined.svg';
import styled from 'styled-components';
import { ComponentToString } from '@/v5/helpers/react.helper';
import { OverlappingContainer } from '@controls/overlappingContainer/overlappingContainer.styles';

export const SplitPane = styled(BaseSplitPane)<PropsWithChildren<SplitPaneProps> & { $isCalibrating: boolean }>`
	height: calc(100vh - ${({ $isCalibrating }) => $isCalibrating ? 142 : 62}px) !important;
	.Resizer {
		box-sizing: border-box;
		background-clip: padding-box;
		z-index: 1;

		/* Hide nodule when 2d viewer is hidden */
		&:has(+ .Pane2:empty) {
			display: none;
		}
		&.vertical {
			background-color: ${({ theme }) => theme.palette.base.light};
			width: 24px;
			margin: 0 -12px;
			border-left: 12px solid transparent;
			border-right: 11px solid transparent;
			flex-shrink: 0;
			cursor: pointer;

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
	}

	.Pane1 { 
		/* Adds minimum size to panes (only when Pane2 is open) */
		min-width: 68px;
		max-width: calc(100% - 68px);
		&:has(~ .Pane2:empty) {
			max-width: 100%;
		}
	}
	.Pane2 {
		display: contents;
	}
`;

export const LeftPane = styled(OverlappingContainer)`
	width: 100%;
	height: 100%;
	pointer-events: none;
`;

export const Container = styled.div`
	margin: auto;
`;
