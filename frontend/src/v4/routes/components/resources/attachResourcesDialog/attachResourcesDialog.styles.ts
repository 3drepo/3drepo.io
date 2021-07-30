/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import { DialogContent, InputAdornment } from '@material-ui/core';
import Dropzone from 'react-dropzone';
import styled from 'styled-components';
import { COLOR } from '../../../../styles';

const dropZoneColors = (normalColour, dragColour, errorColour) => (props: any) =>
	props.error ? errorColour :
	props.isDragActive ? dragColour :  normalColour ;

export const Container = styled(DialogContent)`
	width: 500px;
	height: 250px;
	&& {
		padding-top: 0;
		padding-bottom: 68px;
	}
`;

export const StyledDropZone = styled(Dropzone)`
	margin-left: 20px;
	margin-top: 20px;
	margin-right: 20px;
	margin-bottom: 0;
`;

export const ResourcesListContainer = styled.div`
	overflow: hidden;
	width: 500px;
	& >:last-child {
		height: 55px;
	}
`;

export const ResourcesListScroller = styled.div`
	margin-top: 20px;
	overflow-y: auto;
	width: 520px;
	max-height: 114px;
`;

export const ResourceListItem = styled.div`
	display: flex;
	& >:first-child {
		flex-grow: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		padding-top: 4px;
	}
`;

export const ResourceListLinkItem = styled.div`
	display: flex;
	& >:first-child {
		flex-grow: 1;
	}
`;

export const AddLinkContainer = styled.div`
	margin-top: 20px;
`;

export const DropzoneContent = styled.div`
	cursor: ${(props: any) => props.error ? 'default' : 'pointer' };
	background-color: ${dropZoneColors('transparent', COLOR.PRIMARY_MAIN_6, COLOR.WARNING_LIGHT)};
	position: relative;
	padding: 10px;
	border-width: 3px;
	border-color: ${dropZoneColors(COLOR.BLACK_50, COLOR.PRIMARY_MAIN_80, COLOR.NEGATIVE_87)};
	color: ${dropZoneColors(COLOR.BLACK_60, COLOR.PRIMARY_MAIN_80, COLOR.NEGATIVE)};
	border-style: dashed;
	border-radius: 5px;
	text-align: center;
	transition: background-color 0.3s ease,color 0.3s ease,border-color 0.3s ease ;
` as any;
