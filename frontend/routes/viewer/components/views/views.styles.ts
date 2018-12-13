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
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import TextField from '@material-ui/core/TextField';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';

import { Form } from 'formik';

import { COLOR } from '../../../../styles/colors';

export const FooterWrapper = styled.div`
  display: flex;
  width: 100%;
  position: relative;
  justify-content: flex-end;
  align-items: center;
  padding: 10px 16px;
  box-sizing: border-box;
`;

export const ViewsCountInfo = styled.p`
  color: ${COLOR.BLACK_40};
  text-align: left;
  height: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  width: 100%;
`;

export const ViewpointsList = styled(MenuList)`
  && {
    padding: 0;
    overflow: auto;
    max-height: 70vh;
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
` as any;

export const Thumbnail = styled.img`
  width: 79px;
  height: 79px;
`;

export const ThumbnailPlaceholder = styled.div`
  width: 79px;
  height: 79px;
  border: 1px solid ${COLOR.BLACK_20};
`;

export const Name = styled.h3`
  margin-left: 16px;
  font-weight: 400;
  font-size: 14px;
  color: ${COLOR.BLACK};
`;

export const EmptyStateInfo = styled.p`
  padding: 24px;
`;

export const NewViewpointName = styled(TextField)`
  && {
    margin-left: 12px;
  }
`;

export const NewItemWrapper = styled.div`
  display: flex;
  flex: 1;
`;

export const StyledSaveIcon = styled(SaveIcon)`
  && {
    cursor: pointer;

    &:hover {
      color: ${COLOR.BLACK_40};
    }
  }
`;

export const StyledCancelIcon = styled(CancelIcon)`
  && {
    cursor: pointer;

    &:hover {
      color: ${COLOR.BLACK_40};
    }
  }
`;

export const StyledDeleteIcon = styled(DeleteIcon)`
  && {
    cursor: pointer;
    margin-top: 8px;

    &:hover {
      color: ${COLOR.BLACK_40};
    }
  }
`;

export const StyledEditIcon = styled(EditIcon)`
  && {
    cursor: pointer;

    &:hover {
      color: ${COLOR.BLACK_40};
    }
  }
`;

export const SearchField = styled(Input)`
  && {
    padding: 12px;
    width: 100%;
  }
`;

export const NameRow = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const IconsGroup = styled.div`
  display: flex;
  align-items: center;
  margin-right: 21px;
  flex-direction: column;
`;

export const StyledForm = styled(Form)`
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: space-between;
`;

export const AddIconButton = styled(IconButton)`
  && {
    margin-right: -12px;
  }
`;

export const SaveIconButton = styled(IconButton)`
  && {
    margin-top: 8px;
    padding: 0;

    &:hover {
      background-color: transparent;
    }
  }
`;
