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
import { MenuItem as MenuItemComponent } from '@material-ui/core';
import { DateTime } from '../../../../../components/dateTime/dateTime.component';
import { SelectField as SelectFieldComponent } from '../../../../../components/selectField/selectField.component';
import { COLOR } from '../../../../../../styles';

export const Container = styled.div``;

export const SelectField = styled(SelectFieldComponent)`
  && {
    min-width: 80px;
  }

	&&:before {
		border-bottom: none !important;
	}

  svg {
    opacity: ${(props) => props.disabled || props.readOnly ? 0 : 1};
  }
`;

export const MenuItem = styled(MenuItemComponent)`
  && {
    min-width: 200px;
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }
`;

export const Name = styled.div`
  color: #757575;
  font-size: 14px;
`;

export const Date = styled.div`
  color: ${COLOR.BLACK_20};
  font-size: 14px;
`;
