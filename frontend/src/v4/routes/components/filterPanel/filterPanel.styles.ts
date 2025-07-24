/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Popper from '@mui/material/Popper';
import TextField from '@mui/material/TextField';
import Copy from '@mui/icons-material/FileCopy';
import styled, { css } from 'styled-components';
import { COLOR } from './../../../styles/colors';

interface IContainer {
	filtersOpen: boolean;
}

interface ISelectedFilters {
	empty: boolean;
	filtersOpen: boolean;
}

interface IInputContainer {
	menuHidden: boolean;
}

interface IChips {
	filtersOpen: boolean;
}

export const Container = styled.div<IContainer>`
	background-color: ${COLOR.WHITE};
	position: relative;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	height: ${(props) => props.filtersOpen ? '45px' : 'auto'};
	flex: none;
	
	${(props) => props.filtersOpen && 'height: 57px;'}
`;

export const Chips = styled.div<IChips>`
	position: relative;
	width: 380px;
	box-sizing: border-box;

	&.compare {
		margin-left: ${(props) => props.filtersOpen ? '38px' : '0'};
	}
`;

export const FiltersContainer = styled.div<{ empty: boolean }>`
	max-height: 240px;
	min-height: ${({ empty }) => empty ? 0 : 57}px;
	overflow: hidden overlay;
`;

export const SelectedFilters = styled.div<ISelectedFilters>`
	display: flex;
	flex-wrap: wrap;
	overflow: ${(props) => props.filtersOpen ? 'hidden' : 'auto'} hidden;
	position: relative;
	box-sizing: border-box;
	
	${Chips} {
		padding: ${(props) => props.empty ? '0 40px 0 8px' : '4px 40px 0 8px'};
	}

	${({ theme, empty}) =>  !empty && css`
		border-bottom: solid 1px ${theme.palette.base.lightest};

		${Chips} {
			padding: 9px 40px 9px 15px;
		}
	`}
`;

export const InputContainer = styled.div<IInputContainer>`
	display: block;
	justify-content: flex-end;
	position: relative;
	margin: 0;
	min-height: ${(props) => props.menuHidden ? `50px` : '0'};

	.react-autosuggest__container {
		height: 100%;
		flex: 1;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;

		input {
			font-size: 14px;
			height: 30px;
			padding: 10px 14px;

			&::placeholder {
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
		margin-top: 0;
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

export const SuggestionsScrollArea = styled.div`
	max-height: 250px;
	overflow: 'overlay';

	.react-autosuggest__suggestions-list {
		max-height: unset;
	}
`;

export const StyledTextField = styled(TextField)`
	font-size: 14px;
	margin-bottom: 12px;

	&& {
		height: 100%;
	}
`;

export const StyledChip = styled(Chip)`
	&& {
		margin-right: 4px;
		margin-top: 3px;
		margin-bottom: 3px;
	}
`;

export const FiltersButton = styled(IconButton)`
	align-self: flex-end;

	&& {
		position: absolute;
		z-index: 1;
		top: 8px;
		width: 28px;
		height: 28px;
		right: 8px;

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
		bottom: 10px;
		right: 10px;
	}
`;

export const CopyIcon = styled(Copy)`
	&& {
		font-size: 18px;
		position: absolute;
	}
`;

export const ButtonWrapper = styled.div`
	position: relative;
	height: 50px;
`;

export const Placeholder = styled.div`
	position: absolute;
	left: 12px;
	color: ${COLOR.BLACK_60};
	font-size: 14px;
	top: 50%;
	transform: translateY(-50%);
	user-select: none;
	cursor: text;
	display: flex;
	align-items: center;
`;

export const PlaceholderText = styled.span`
	margin-left: 4px;
`;
