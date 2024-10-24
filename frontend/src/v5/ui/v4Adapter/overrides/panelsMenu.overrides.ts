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
import { InputContainer } from '@/v4/routes/components/filterPanel/filterPanel.styles';
import { Wrapper as ChildMenu } from '@/v4/routes/components/filterPanel/components/childMenu/childMenu.styles';
import { Wrapper as FoldableMenu } from '@/v4/routes/components/foldableMenu/foldableMenu.style';

// all the buttons on the left hand side of the viewer
export default css`
	${LeftPanelsButtons} {
		width: 68px;
		margin-top: 10px;

		${ButtonWrapper} {
			margin-bottom: 0;
		}

		${StyledIconButton} {
			margin-right: -4px;
			margin-bottom: 2px;
			background-color: ${({ theme }) => theme.palette.secondary.main};

			&:hover svg :is(path, circle) {
				fill: ${({ theme }) => theme.palette.primary.main};
				color: ${({ theme }) => theme.palette.primary.main};
			}

			&[active="1"] {
				background-color: ${({ theme }) => theme.palette.primary.main};
				svg :is(path, circle) {
					fill: ${({ theme }) => theme.palette.primary.contrast};
					color: ${({ theme }) => theme.palette.primary.contrast};
				}
			}
		}
	}

	${LeftPanels} {
		left: 80px;
	}

	${LeftPanels},
	${RightPanels} {
		margin-top: 8px;
		box-sizing: border-box;

		${InputContainer} .react-autosuggest__container input {
			height: 50px;
			padding: 0 40px 0 12px;
		}
	}
	
	${ChildMenu}, ${FoldableMenu} {
		border-radius: 8px;
	}
`;
