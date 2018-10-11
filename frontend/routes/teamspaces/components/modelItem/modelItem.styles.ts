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

import { FONT_WEIGHT, COLOR } from '../../../../styles';

export const Container = styled.div`
  padding-left: 112px;
  font-size: 14px;
  font-weight: ${FONT_WEIGHT.SEMIBOLD};
  color: ${COLOR.BLACK_60};
`;

export const SubmodelsList = styled.div`
  color: ${COLOR.BLACK_30};
  font-weight: ${FONT_WEIGHT.NORMAL};
  padding-right: 30px;
  line-height: 25px;
  padding-bottom: 10px;
  font-size: 12px;
  margin-top: -10px;
`;

export const Time = styled.div`
  color: ${COLOR.BLACK_30};
  font-weight: ${FONT_WEIGHT.NORMAL};
  margin-right: 8px;
  font-size: 12px;
`;
