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

import { BodyWrapper as CustomTableBody, Cell, Head, Row } from '@/v4/routes/components/customTable/customTable.styles';
import styled, { css } from 'styled-components';
import { Mark as HighlighterMark } from '@/v4/routes/components/highlight/highlight.styles';
import { SearchField } from '@/v4/routes/components/customTable/components/cellUserSearch/cellUserSearch.styles';
import { PermissionsCellContainer } from '@/v4/routes/components/permissionsTable/permissionsTable.styles';
import { SortLabel } from '@/v4/routes/components/customTable/components/tableHeading/tableHeading.styles';
import { Name as UserNameCell } from '@/v4/routes/components/userItem/userItem.styles';
import { ArrowButton } from '@/v4/routes/viewerGui/components/previewListItem/previewListItem.styles';
import { StyledIconButton } from '@/v4/routes/teamspaces/components/tooltipButton/tooltipButton.styles';
import { LeftPanels, LeftPanelsButtons } from '@/v4/routes/viewerGui/viewerGui.styles';
import { ButtonWrapper } from '@/v4/routes/viewerGui/components/panelButton/panelButton.styles';
import { Container, Submenu } from '@/v4/routes/viewerGui/components/toolbar/toolbar.styles';
import { Container as RevisionsSwitchContainer } from '@/v4/routes/viewerGui/components/revisionsSwitch/revisionsSwitch.styles';
import { RadioContainer as TableHeadingRadioContainer, TableHeadingRadioButton, TableHeadingRadioTooltip } from '@/v4/routes/components/customTable/components/tableHeadingRadio/tableHeadingRadio.styles';
import bottomToolbar from './overrides/bottomToolbar.overrides';
import panelsMenu from './overrides/panelsMenu.overrides';
import leftPanel from './overrides/leftPanel.overrides';
import issueSequences from './overrides/sequences.overrides';
import issueProperties from './overrides/properties.overrides';
import customTable from './overrides/customTable.overrides';
import previewDetails from './overrides/preview/previewDetails.overrides';
import previewItem from './overrides/preview/previewItem.overrides';
import previewComments from './overrides/preview/previewComments.overrides';
import avatarPopover from './overrides/avatarPopover.overrides';
import issueAttachments from './overrides/issues/attachments.overrides';
import issueShapes from './overrides/issues/shapes.overrides';
import { hexToOpacity } from '../themes/theme';

// all the .simplebar-... stuff is to disable simplebar
const customTableStyling = css`
	${CustomTableBody} {
		position: relative;
		height: auto;

		div {
			position: relative;
			height: auto;
		}

		.simplebar-content {
			border: 1px solid ${({ theme }) => theme.palette.base.lightest};
			border-radius: 5px;
			background-color: ${({ theme }) => theme.palette.primary.contrast};
		}

		.simplebar-content-wrapper {
			height: auto !important;
			max-height: initial;
		}

		.simplebar-placeholder {
			display: none;
		}
	}

	${Head} {
		border: 0;

		${Cell} {
			padding-top: 22px;
		}
	}

	${UserNameCell} {
		${({ theme }) => theme.typography.h5};
		color: ${({ theme }) => theme.palette.secondary.main};
	}

	${Row} {
		min-height: 80px;
	}

	${SortLabel} {
		margin: 0;
		padding-left: 10px;
		${({ theme }) => theme.typography.kicker};
		flex-direction: row;
		svg {
			fill: transparent;
			width: 10px;
			margin-left: 2px;
		}

		::before {
			background: transparent;
		}

		&.MuiTableSortLabel-active {
			svg {
				fill: ${({ theme }) => theme.palette.base.main};
			}
		}
	}

	${PermissionsCellContainer} {
		justify-content: flex-start;
	}

	${TableHeadingRadioContainer} {
		justify-content: flex-start;
		align-items: baseline;
		margin-top: -22px;
	}

	${TableHeadingRadioTooltip} {
		margin-left: -50px;
	}

	${TableHeadingRadioButton} {
		height: 20px;
	}

	${SearchField} {
		label {
			${({ theme }) => theme.typography.kicker};
		}

		input {
			padding-bottom: 5px;
			padding-left: 0;
			padding-top: 0;
			${({ theme }) => theme.typography.body1};
		}

		.search-field__label {
			margin-top: 3px;
			transform: translate(13px,39px) scale(1);

			&[data-shrink='true'] {
				transform: translate(13px, 20px) scale(1) !important;
			}
		}
	}
`;

const viewerStyling = css`
	${ArrowButton} {
		background-color: ${({ theme }) => theme.palette.primary.dark};
		padding: 0;
		margin: 0;

		&:hover {
			background-color: ${({ theme }) => theme.palette.primary.main};
		}
	}
`;

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

	${customTableStyling}
	${viewerStyling}

	${avatarPopover}

	${HighlighterMark} {
		background-color: ${({ theme }) => theme.palette.primary.light};
		font-weight: inherit;
	}

	${PanelsMenuStyling}

	${customTable}
	
	${leftPanel}
	${panelsMenu}
	${bottomToolbar}

	${previewItem}
	${previewDetails}
	${previewComments}

	${issueAttachments}
	${issueShapes}
	${issueSequences}
	${issueProperties}

	${BottomToolbar}
	${RevisionsSwitchContainer} {
		display: none;
	}
`;
