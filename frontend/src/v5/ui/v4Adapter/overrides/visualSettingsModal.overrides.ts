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

import {
	NegativeActionButton as ResetButton,
	NeutralActionButton as CancelButton,
	VisualSettingsButtonsContainer as Actions,
} from '@/v4/routes/components/topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';
import styled from 'styled-components';

export const V5VisualSettingsOverrides = styled.div`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};

	${Actions} {
		box-shadow: ${({ theme }) => theme.palette.shadows.level_7};
		height: 65px;
		bottom: 0;
		justify-content: left;
		align-items: center;
		padding: 0 7px;
		box-sizing: border-box;
		.MuiButtonBase-root {
			margin: 5px;
		}
		${ResetButton} {
			background-color: transparent;
			color: ${({ theme }) => theme.palette.secondary.main};
			margin-right: auto;
			:hover {
				text-decoration: underline;
			}
		}
		${CancelButton} {
			border: 1px solid ${({ theme }) => theme.palette.secondary.main};
			color: ${({ theme }) => theme.palette.secondary.main};
			:hover {
				background-color: ${({ theme }) => theme.palette.secondary.main};
				color: ${({ theme }) => theme.palette.primary.contrast};
			}
		}
		.MuiButtonBase-root:last-of-type {
			color: ${({ theme }) => theme.palette.primary.contrast};
			background-color: ${({ theme }) => theme.palette.primary.main};
			:hover {
				background-color: ${({ theme }) => theme.palette.primary.dark};
			}
			&.Mui-disabled {
				background-color: ${({ theme }) => theme.palette.base.lightest};
			}
		}
	}
`;
