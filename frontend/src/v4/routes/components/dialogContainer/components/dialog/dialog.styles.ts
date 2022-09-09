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

import DialogActionsComponent from '@mui/material/DialogActions';
import DialogTitleComponent from '@mui/material/DialogTitle';
import styled from 'styled-components';

import { COLOR } from '../../../../../styles';
import {
	StyledIconButton,
} from '../../../../viewerGui/components/panelBarActions/lockPanelButton/lockPanelButton.styles';

export const DialogActions = styled(DialogActionsComponent)`
	&& {
		margin-right: 8px;
		margin-bottom: 10px;
	}
`;

export const DialogTitle = styled(DialogTitleComponent)`
	&& {
		align-items: center;
		justify-content: space-between;
		padding-right: 0;
	}
`;

export const TopDialogActions = styled.span`
	&& {
		${StyledIconButton} {
			color: ${COLOR.WHITE};
		}
	}
`;
