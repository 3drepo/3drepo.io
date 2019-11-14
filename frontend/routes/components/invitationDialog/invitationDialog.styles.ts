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

import MenuItemBase from '@material-ui/core/MenuItem';
import SelectBase from '@material-ui/core/Select';
import TextFieldBase from '@material-ui/core/TextField';
import styled from 'styled-components';
import { COLOR } from '../../../styles';

export const Container = styled.div`
	padding: 30px;
	min-width: 40vw;
	display: flex;
	flex-direction: column;
`;

export const TextField = styled(TextFieldBase)`
	&& {
		margin-bottom: 10px;
	}
`;

export const StyledSelect = styled(SelectBase)`
	&& {
		/* margin-bottom: 10px; */
	}
`;

export const EmptySelectValue = styled(MenuItemBase)`
	&& {
		font-size: 14px;
		color: ${COLOR.BLACK_60};
	}
`;
