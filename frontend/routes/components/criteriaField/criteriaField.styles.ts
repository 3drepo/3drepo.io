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
import ChipComponent from '@material-ui/core/Chip';
import IconButtonComponent from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';
import FormControlComponent from '@material-ui/core/FormControl';
import SaveIcon from '@material-ui/icons/Save';

import ListComponent from '@material-ui/core/List';
import MenuItemComponent from '@material-ui/core/MenuItem';

import { SelectField as SelectFieldComponent } from '../selectField/selectField.component';

export const Container = styled.div`
  margin: 8px 0;
`;

export const SelectedCriteria = styled.div`
  position: relative;
  min-height: 45px;
  padding: 5px 0;
`;

export const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
	padding-right: 40px;
	overflow: hidden;
	position: relative;
`;

export const Chip = styled(ChipComponent)`
  && {
		margin-right: 4px;
    margin-top: 3px;
    margin-bottom: 3px;
	}
`;

export const ButtonContainer = styled.div`
  position: absolute;
  right: 0;
  bottom: 3px;
  display: flex;
  align-items: center;
`;

export const IconButton = styled(IconButtonComponent)`
	&& {
		width: 28px;
		height: 28px;
    padding: 4px;
	}
`;

export const StyledMoreIcon = styled(MoreIcon)`
	&& {
		font-size: 20px;
	}
`;

export const FormControl = styled(FormControlComponent)`
  && {
    margin: 8px 0;
    width: 100%;
  }
`;

export const FormContainer = styled.div`
  background-color: #F9F9F9;
  border-top: 1px solid #CFCFCF;
  padding: 12px;
  padding-bottom: 24px;
`;

export const CriteriaList = styled(ListComponent)`
  max-height: 300px;
  overflow: auto;
`;

export const CriterionType = styled.li`

`;

export const Operators = styled.ul`
  padding: 0;
`;

export const SelectField = styled(SelectFieldComponent)`
  width: 100%;
`;

export const MenuItem = styled(MenuItemComponent)`
  && {
    padding: 4px 10px;
    height: 30px;
    min-width: 180px;
  }
`;

export const NewCriterionFooter = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: flex-end;
`;

export const PasteContainer = styled.div`
  width: 100%;
  align-items: center;
`;

export const StyledSaveIcon = styled(SaveIcon)`
	&& {
		font-size: 20px;
	}
`;
