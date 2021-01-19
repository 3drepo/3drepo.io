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

import Fab from '@material-ui/core/Fab';
import Popover from '@material-ui/core/Popover';
import styled from 'styled-components';

export const Container = styled.div``;

export const FloatingButtonContainer = styled.div`
	position: absolute;
	top: -22px;
	right: 14px;
	z-index: 1;
`;

export const FloatingButton = styled(Fab).attrs({
	classes: {
		disabled: 'button--disabled'
	}
})`
	&&.button--disabled {
		background: #d9d9d9;
		color: #868686;
	}
`;

export const Panel = styled(Popover).attrs({
	classes: {
		paper: 'floating-panel'
	}
})`
	.floating-panel {
		margin-left: -15px;
		margin-top: -20px;
		padding: 16px;
		font-size: 14px;
		box-sizing: border-box;
	}
`;
