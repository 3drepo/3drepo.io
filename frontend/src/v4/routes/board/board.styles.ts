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

import Fab from '@mui/material/Fab';
import FormControlBase from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import styled from 'styled-components';
import { Typography } from '@controls/typography';
import { COLOR } from '../../styles';
import { PreviewListItem } from '../viewerGui/components/previewListItem/previewListItem.component';
import { ViewerPanelContent } from '../viewerGui/components/viewerPanel/viewerPanel.styles';

export const Container = styled.div`
	height: 100%;
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: column;

	& .MuiInputBase-root {
		width: 100%;
	}
`;

export const BoardContainer = styled.div`
	height: 100%;
	box-sizing: border-box;
	overflow: hidden;

	> div {
		height: 100%;
	}

	.kanban-board {
		height: 100%;
	}
		
	.kanban-board .lane-column:first-child {
		margin-left: 75px;
	}

	.kanban-board .lane-column:last-child {
		margin-right: 75px;
	}
`;

export const Config = styled.div`
	background-color: ${COLOR.WHITE};
	flex-basis: 30px;
	padding: 10px 15px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: relative;
	z-index: 1;
	background-color: transparent;
	padding: 10px 75px;
`;

export const DataConfig = styled.div``;

export const ViewConfig = styled.div`
	align-items: center;
	display: flex;
`;

export const AddButton = styled(Fab).attrs({
	size: 'small',
})`
	background-color: ${({ theme }) => theme.palette.primary.main};
	text-transform: none;
	margin-bottom: -28px;
	margin-left: 0;
	height: 35px;
	width: fit-content;
	border-radius: 8px;
	font-size: 0.75rem;
	font-weight: 600;
	padding: 8px 16px;
	border: none;

	svg {
		background: currentColor;
		border-radius: 50%;
		fill: ${({ theme }) => theme.palette.primary.main};
		height: 17px;
		width: 17px;
		margin-right: 8px;
		transform: scale(.7);
	}

	&:hover {
		background-color: ${({ theme }) => theme.palette.primary.dark};
		
		svg {
			fill: ${({ theme }) => theme.palette.primary.dark};
		}
	}

	&:active {
		box-shadow: none;
		background-color: ${({ theme }) => theme.palette.primary.darkest};

		svg {
			fill: ${({ theme }) => theme.palette.primary.darkest};
		}
	}

	&:disabled {
		background-color: ${({ theme }) => theme.palette.base.lightest};
		color: ${({ theme }) => theme.palette.primary.contrast};
		
		svg {
			fill: ${({ theme }) => theme.palette.base.lightest};
		}
	}
`;

export const TitleActions = styled.div`
	display: flex;
	right: -15px;
	position: relative;
`;

export const TypesSelect = styled(Select)``;

export const TitleContainer = styled.div`
	align-items: center;
	color: ${COLOR.WHITE_87};
	display: flex;
	justify-content: space-between;
	width: 100%;

	${TypesSelect} {
		div {
			color: ${COLOR.WHITE_87};
			font-size: 20px;
			display: flex;
			align-items: center;
		}
	}

	svg {
		color: ${COLOR.WHITE_87};
	}
`;

export const SelectContainer = styled.div`
	align-items: center;
	display: flex;
	width: 140px;
`;

export const SelectLabel = styled.div`
	color: ${COLOR.BLACK_60};
	font-size: 14px;
	margin-right: 3px;
	margin-bottom: 2px;
`;

export const LoaderContainer = styled.div`
	display: flex;
	position: absolute;
	width: 100%;
	justify-content: center;
	overflow: hidden;
	left: 0;
	top: 110px;
	height: calc(100% - 120px);
`;

export const FormWrapper = styled.div<{ size: string }>`
	width: ${({ size }) => size === 'sm' ? 400 : 800}px;

	${ViewerPanelContent} {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		flex: auto;
	}
`;

export const NoDataMessage = styled(Typography).attrs({
	variant: 'h2',
	color: 'base',
})`
	align-self: center;
`;

export const Filters = styled.div`
	display: flex;
`;

export const FilterButton = styled.button`
	background-color: ${(props: any) => props.active ? COLOR.BLACK_16 : COLOR.WHITE};
	color: ${(props: any) => props.active ? COLOR.WHITE : COLOR.BLACK_54};
	border: none;
	border-radius: 14px;
	display: block;
	font-size: 12px;
	margin: 0 6px;
	padding: 2px 8px;
	outline: none;
	white-space: nowrap;
	cursor: ${(props: any) => props.disabled ? 'not-allowed' : 'pointer'};
`;

export const BoardDialogTitle = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	width: 100%;

	svg {
		color: ${COLOR.WHITE_87};
	}
`;

export const Title = styled.div``;

export const BoardItem = styled(PreviewListItem)`
	&& {
		border: 1px solid  ${({ theme }) => theme.palette.base.lightest};
		border-radius: 8px;
	}
`;

export const FormControl = styled(FormControlBase)`
	&& {
		margin-right: 15px;
	}
`;

export const ModelSelectFormControl = styled(FormControl)`
	&& {
		min-width: 373px;
	}
`;

