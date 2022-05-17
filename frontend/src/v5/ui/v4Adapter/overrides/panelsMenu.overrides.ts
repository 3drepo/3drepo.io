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

import { css } from 'styled-components';
import { StyledIconButton } from '@/v4/routes/teamspaces/components/tooltipButton/tooltipButton.styles';
import { ButtonWrapper } from '@/v4/routes/viewerGui/components/panelButton/panelButton.styles';
import { LeftPanels, LeftPanelsButtons, RightPanels } from '@/v4/routes/viewerGui/viewerGui.styles';

// all the buttons on the left hand side of the viewer
export default css`

	${LeftPanelsButtons} {
		width: 68px;
		margin-top: 10px;
		padding-top: 72px;

		${ButtonWrapper} {
			margin-bottom: 0;
		}
	}

	${LeftPanels} {
		left: 80px;
	}

	${LeftPanels},
	${RightPanels} {
		margin-top: 8px;
		padding-top: 72px;
		box-sizing: border-box;

		@media (min-width: 1520px) {
			height: calc(100% - 38px);
		}
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
