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
import { COLOR } from './../../../styles/colors';
import Popper from '@material-ui/core/Popper';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import IconButton from '@material-ui/core/IconButton';

export const Container = styled.div`
  background-color: ${COLOR.WHITE};
	position: relative;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	padding: 0 5px;
	height: ${(props: any) => props.filtersOpen ? '64px' : '100%'};
` as any;

export const SelectedFilters = styled.div`
  display: flex;
  margin: 10px 0;
  flex-wrap: wrap;
	padding-right: 40px;
	min-height: ${(props: any) => props.empty ? '0' : '50px'};
` as any;

export const InputContainer = styled.div`
  display: block;
	justify-content: flex-end;
	position: relative;

  .react-autosuggest__container {
    width: 100%;
		height: 36px;
    flex: 1;
    position: absolute;
    bottom: 0;
  }
`;

export const SuggestionsList = styled(Popper)`
	z-index: 1;
	margin-top: -15px;

	.react-autosuggest__suggestions-list {
		max-height: 250px;
		overflow: auto;
		padding-left: 0;
	}

	.react-autosuggest__suggestion {
		list-style: none;
		height: 44px;
		border-bottom: 1px solid ${COLOR.BLACK_6};
		display: flex;
		flex: 1;
		align-items: center;
	}

	.react-autosuggest__suggestion > div {
		font-size: 12px;
		flex: 1;
  }
`;

export const StyledTextField = styled(TextField)`
	font-size: 14px;
	margin-bottom: 12px;
`;

export const StyledChip = styled(Chip)`
  margin: 8px 3px;
`;

export const StyledButtonMenu = styled(ButtonMenu)`
  position: absolute;
	right: 0;
`;

export const FiltersButton = styled(IconButton)`
	align-self: flex-end;

	&& {
		position: absolute;
		top: 5px;
	}
`;

export const ButtonContainer = styled.div`
	display: flex;
	width: 100%;
	justify-content: flex-end;
`;
