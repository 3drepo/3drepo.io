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
import { Mark as HighlighterMark } from '@/v4/routes/components/highlight/highlight.styles';
import leftPanelStyling from './overrides/leftPanel.overrides';
import customTableStyling from './overrides/customTable.overrides';
import viewerStyling from './overrides/viewer.overrides';
import { ArrowButton } from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { StyledIconButton } from '@/v4/routes/teamspaces/components/tooltipButton/tooltipButton.styles';
import { LeftPanels, LeftPanelsButtons } from '@/v4/routes/viewerGui/viewerGui.styles';
import { ButtonWrapper } from '@/v4/routes/viewerGui/components/panelButton/panelButton.styles';
import { Container, Submenu } from '@/v4/routes/viewerGui/components/toolbar/toolbar.styles';
import { hexToOpacity } from '../themes/theme';

// all the buttons on the left hand side of the viewer
const PanelsMenuStyling = css`

	${LeftPanelsButtons} {
		width: 68px;
		margin-top: 10px;

		${ButtonWrapper} {
			margin-bottom: 0;
		}
	}

	${LeftPanels} {
		left: 80px;
	}

	${StyledIconButton} {
		margin-right: -4px;

		&, &:hover {
			background-color: ${({ theme }) => theme.palette.primary.contrast};
		}

		svg path,
		svg circle {
			fill: ${({ theme }) => theme.palette.secondary.main};
		}

		&:hover {
			svg path,
			svg circle {
				fill: ${({ theme }) => theme.palette.primary.main};
			}
		}

		&[active="1"] {
			background-color: ${({ theme }) => theme.palette.secondary.main};

			svg path,
			svg circle {
				fill: ${({ theme }) => theme.palette.primary.main};
				color: ${({ theme }) => theme.palette.primary.main};
			}
		}
	}
`;

const BottomToolbar = css`
	${Container} {
		background-color: ${({ theme }) => hexToOpacity(theme.palette.secondary.main, 90)};
		border: 0;
		border-radius: 5px;
		bottom: 30px;
		height: 40px;
		width: 554px;
		justify-content: space-evenly;
		padding: 2px 10px;

		${StyledIconButton} {
			svg path,
			svg circle {
				fill: ${({ theme }) => theme.palette.primary.contrast};
			}
		}
		/* stylelint-disable-next-line */
		& :not(${Submenu} ${StyledIconButton}) {
			background: transparent;
			border-radius: 0;
			margin: 0;
		}

		${Submenu} ${StyledIconButton} {
			background-color: ${({ theme }) => hexToOpacity(theme.palette.secondary.main, 90)};
			margin: 8px 0;
		}
	}

`;

export const V4OverridesContainer = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;

	${ArrowButton}

	${customTableStyling}

	${viewerStyling}

	${HighlighterMark} {
		background-color: ${({ theme }) => theme.palette.primary.light};
		font-weight: inherit;
	}

	${leftPanelStyling}
	${PanelsMenuStyling}

	${BottomToolbar}
`;
