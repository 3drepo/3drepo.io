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
import { COLOR } from '../../styles';
import { PreviewListItem } from '../viewerGui/components/previewListItem/previewListItem.component';
import { ViewerPanelContent } from '../viewerGui/components/viewerPanel/viewerPanel.styles';

export const Container = styled.div`
	height: 100%;
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
`;

export const BoardContainer = styled.div`
	height: 100%;
	box-sizing: border-box;
	border-top: 1px solid ${COLOR.BLACK_6};
	overflow: hidden;

	> div {
		height: 100%;
	}

	.react-trello-board {
		background-color: initial;
		height: 100%;
		padding: 16px 12px;
		overflow-y: hidden;
		overflow-x: auto;
		box-sizing: border-box;

		> div {
			height: 100%;
			min-width: 100%;
		}
	}

	.smooth-dnd-container {
		height: 100%;
	}

	.react-trello-lane {
		background-color: ${COLOR.BLACK_6};
		border: 1px solid ${COLOR.BLACK_12};
		min-height: 100%;
		max-height: none;
		height: inherit;
		margin: 0 5px;
		min-width: 300px;
		width: calc((100% / 4) - 2 * 5px);
		padding: 10px 8px;

		> div {
			width: 100%;
		}

		header {
			color: ${COLOR.BLACK_70};
			display: flex;
			align-items: center;

			> span:nth-child(1) {
				font-size: 14px;
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			> span:nth-child(2) {
				font-size: 12px;
				line-height: 1;
			}
		}
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
`;

export const DataConfig = styled.div``;

export const ViewConfig = styled.div`
	align-items: center;
	display: flex;
`;

export const AddButton = styled(Fab).attrs({
	size: 'small',
})``;

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
	height: 100%;
	justify-content: center;
	overflow: hidden;
	top: 0;
	left: 0;
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

export const NoDataMessage = styled.div`
	align-self: center;
	color: ${COLOR.BLACK_54};
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
		margin-bottom: 6px;
		border: 1px solid ${COLOR.BLACK_12};
	}
`;

export const FormControl = styled(FormControlBase)`
	&& {
		margin-right: 15px;
	}
`;
