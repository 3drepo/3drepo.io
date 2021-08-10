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

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import styled from 'styled-components';

import * as CellSelect from '../components/customTable/components/cellSelect/cellSelect.styles';

const OPTIONS_HEIGHT = '100px';

export const Options = styled(Grid)`
	width: 100%;
	padding: 0;
	min-height: ${OPTIONS_HEIGHT};

	& > * {
		padding: 24px;
		display: flex;
		align-items: center;
	}

	${CellSelect.StyledSelect} {
		width: 100%;
	}
`;

export const SelectContainer = styled(Grid)`
	width: 45%;
`;

export const IconLeft = styled(KeyboardArrowLeft)`
	margin-left: -8px;
`;

export const IconRight = styled(KeyboardArrowRight) `
	margin-right: -8px;
`;

export const SwitchButton = styled(Button)`
	&& {
		padding-left: 8px;
		padding-right: 8px;
	}
`;
