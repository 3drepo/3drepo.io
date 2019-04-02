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
import { Checkbox as CheckboxComponent } from '@material-ui/core';
import { FilterPanel as FilterPanelComponent } from '../../../../../components/filterPanel/filterPanel.component';
import { COLOR } from '../../../../../../styles';

export const FilterPanel = styled(FilterPanelComponent)`
  && {
    flex: 1;

    .react-autosuggest__container {
      input {
        padding: 10px 14px 10px 48px;
      }
    }
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  position: relative;
`;

export const Checkbox = styled(CheckboxComponent)`
  && {
    position: absolute;
    left: 0;
    bottom: 4px;
    z-index: 1;
  }
`;
