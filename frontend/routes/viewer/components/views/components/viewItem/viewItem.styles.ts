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

import styled, { css } from 'styled-components';
import { Form } from 'formik';
import DeleteIcon from '@material-ui/icons/Delete';
import CancelIcon from '@material-ui/icons/Cancel';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import SaveIcon from '@material-ui/icons/Save';
import TextField from '@material-ui/core/TextField';

import { COLOR } from '../../../../../../styles/colors';
import * as ImageStyles from '../../../../../components/image/image.styles';
import { FONT_WEIGHT } from '../../../../../../styles';

const IconStyles = css`
  cursor: pointer;

  &:hover {
    color: ${COLOR.BLACK_40};
  }
`;

export const ViewpointItem = styled(MenuItem)`
  && {
    height: 80px;
    padding: 8px;
    background-color: ${(props: any) => props.active ? `${COLOR.BLACK_6}` : 'initial'};
  }

  &&:not(:first-child) {
    border-top: 1px solid ${COLOR.BLACK_20};
  }

  ${ImageStyles.StyledImage} {
    width: 79px;
    height: 79px;
  }
` as any;

export const StyledForm = styled(Form)`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: space-between;
`;

export const IconsGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;
`;

export const ThumbnailPlaceholder = styled.div`
  width: 79px;
  height: 79px;
  border: 1px solid ${COLOR.BLACK_20};
`;

export const StyledDeleteIcon = styled(DeleteIcon)`
  && {
    ${IconStyles}
  }
`;

export const StyledEditIcon = styled(EditIcon)`
  && {
    ${IconStyles}
    margin-right: 14px;
  }
`;

export const NewViewpointName = styled(TextField)`
  && {
    margin-left: 12px;
    margin-right: 12px;
  }
`;

export const StyledCancelIcon = styled(CancelIcon)`
  && {
    ${IconStyles}
    margin-right: 14px;
  }
`;

export const StyledSaveIcon = styled(SaveIcon)`
  && {
    ${IconStyles}
  }
`;

export const SaveIconButton = styled(IconButton)`
  && {
    padding: 0;

    &:hover {
      background-color: transparent;
    }
  }
`;

export const NameRow = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Name = styled.h3`
  margin-left: 16px;
  font-weight: ${FONT_WEIGHT.NORMAL};
  font-size: 14px;
  color: ${COLOR.BLACK};
`;
