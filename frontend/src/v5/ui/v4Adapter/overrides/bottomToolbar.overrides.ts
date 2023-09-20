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

import { Container, Submenu, ToolbarButton } from '@/v4/routes/viewerGui/components/toolbar/toolbar.styles';
import { Container as CloseFocusModeButton } from '@/v4/routes/viewerGui/components/closeFocusModeButton/closeFocusModeButton.styles';
import { StyledIconButton } from '@/v4/routes/teamspaces/components/tooltipButton/tooltipButton.styles';
import { hexToOpacity } from '../../themes/theme';

export default css`
	${Container} {
		background-color: ${({ theme }) => hexToOpacity(theme.palette.primary.contrast, 90)};
		border: 0;
		border-radius: 25px;
		bottom: 30px;
		height: 47px;
		width: 554px;
		justify-content: space-evenly;
		padding: 2px 10px;

		${StyledIconButton} {
			color: ${({ theme }) => theme.palette.base.main};

			&:disabled :is(path, circle) {
				fill: ${({ theme }) => theme.palette.base.light};
			}
		}
		/* stylelint-disable-next-line */
		& :not(${Submenu} ${StyledIconButton}) {
			background: transparent;
			border-radius: 0;
			margin: 0;
			${ToolbarButton} {
				&[active="1"] {
					color: ${({ theme }) => theme.palette.primary.main};
				}
			}
		}

		${Submenu} ${StyledIconButton} {
			background-color: ${({ theme }) => hexToOpacity(theme.palette.primary.contrast, 90)};
			margin: 8px 0;
		}
	}

	${CloseFocusModeButton} {
		top: 80px;
	}
`;
