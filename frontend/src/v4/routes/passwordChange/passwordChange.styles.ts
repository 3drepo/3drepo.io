/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import styled from 'styled-components';

import { COLOR } from '../../styles';
import * as PanelStyles from '../components/panel/panel.styles';

export const Container = styled(Grid)`
	&& {
		height: 100%;
		z-index: 1;
	}

	${PanelStyles.Container} {
		margin-top: 30px;
		width: 100%;
		max-width: 350px;
	}

	${PanelStyles.Content} {
		padding: 20px;
	}
`;

export const Message = styled.div`
	color: ${COLOR.BLACK_60};
`;

export const StyledButton = styled(Button)`
	&& {
		margin-left: -5px;
		padding: 0 8px;
	}
` as any;

export const MessageButton = styled(StyledButton)`
	&& {
		margin-top: 15px;
		align-self: start;
	}
`;

export const Buttons = styled(Grid)`
	&& {
		margin-top: 10px;
	}
`;
