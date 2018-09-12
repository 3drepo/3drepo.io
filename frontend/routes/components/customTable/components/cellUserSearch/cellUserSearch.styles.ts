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
import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';

import { FONT_WEIGHT, COLOR } from '../../../../../styles';

export const SearchIcon = styled(Icon)`
  && {
    font-size: 14px;
    font-weight: ${FONT_WEIGHT.SEMIBOLD};
    color: ${COLOR.BLACK_60};
    margin-right: 8px;
  }
`;

export const SearchField = styled(TextField)`
  && {
    margin: 0;
  }

  label, input {
    font-size: 14px;
    font-weight: ${FONT_WEIGHT.SEMIBOLD};
    color: ${COLOR.BLACK_60};
  }

  input {
    padding: 3px 0;
  }

  [class*='-formControl-'] {
    margin-top: 3px;
  }

  label[data-shrink='false'] ~ [class*='-formControl-'] {
    &:before, &:after {
      opacity: 1;
      transform: opacity 200ms ease-in-out;
    }

    &:not(:hover):before {
      opacity: 0;
    }
  }

  label {
    transform: translate(0, 5px) scale(1);

    &[data-shrink='true'] {
      transform: translate(0, -12px) scale(0.75) !important;
    }
  }
`;
