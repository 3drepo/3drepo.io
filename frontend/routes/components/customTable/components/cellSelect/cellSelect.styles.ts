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

import styled from 'styled-components';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { COLOR } from '../../../../../styles';

export const StyledSelect = styled(Select).attrs({
	classes: {
		root: 'select',
		disabled: 'select--disabled',
		icon: 'select__icon'
	}
})`
	width: 100%;

	.select--disabled ~ .select__icon {
		opacity: 0.6;
	}

	.select__icon {
		visibility: ${(props) => props.readOnly ? 'hidden' : 'visible'};
	}
`;

export const Item = styled(MenuItem)`
	&& {
		font-size: 14px;
		color: ${COLOR.BLACK_60};
	}
`;

export const EmptyValue = styled(Item)``;
