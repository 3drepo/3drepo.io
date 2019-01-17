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
import IconButton from '@material-ui/core/IconButton';
import MoreIcon from '@material-ui/icons/MoreVert';

export const Container = styled.div`
  background-color: ${COLOR.WHITE};
	position: relative;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	padding: 0 8px;
	height: ${(props: any) => props.filtersOpen ? '50px' : '100%'};
` as any;

export const SelectedFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
	padding-right: 40px;
	overflow: ${(props: any) => props.filtersOpen ? 'auto' : 'hidden'};
	min-height: ${(props: any) => props.empty ? '0' : '50px'};
	position: relative;
` as any;

export const InputContainer = styled.div`
  display: block;
	justify-content: flex-end;
	position: relative;
	margin: 0 6px;

  .react-autosuggest__container {
		height: 36px;
    flex: 1;
    position: absolute;
    bottom: 0;
		left: 0;
		right: 0;

		input {
			font-size: 14px;

			::placeholder {
				color: ${COLOR.BLACK_60};
				opacity: 1;
			}
		}
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

export const FiltersButton = styled(IconButton)`
	align-self: flex-end;

	&& {
		position: absolute;
    top: 5px;
		width: 28px;
		height: 28px;
		right: 4px;

		svg {
			bottom: 0;
	    position: absolute;
		}
	}
`;

export const ButtonContainer = styled.div`
	display: flex;
	width: 100%;
	justify-content: flex-end;
`;

export const StyledIconButton = styled(IconButton)`
	&& {
		width: 28px;
		height: 28px;
		position: absolute;
    bottom: 6px;
		right: -6px;
	}
`;

export const StyledMoreIcon = styled(MoreIcon)`
	&& {
		font-size: 20px;
		position: absolute;
	}
`;

export const ButtonWrapper = styled.div`
  position: relative;
	height: 50px;
`;
