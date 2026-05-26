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
import { DialogContent } from '@mui/material';
import styled, { css } from 'styled-components';
import { DashedContainer } from '@controls/dashedContainer/dashedContainer.component';

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

export const Content = styled.div``;

export const ResourcesContainer = styled.div`
	width: 520px;
`;

export const DropZone = styled.div`
	margin-left: 20px;
	margin-top: 20px;
	margin-right: 20px;
	margin-bottom: 0;
`;

export const ResourcesListContainer = styled.div`
	overflow: hidden scroll;
	width: 500px;
	& >:last-child {
		height: 55px;
	}
`;

export const ResourcesListScroller = styled.div`
	margin-top: 20px;
	overflow: hidden;
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

export const DropzoneContent = styled(DashedContainer).attrs<{ error?: boolean, isDragActive?: boolean }>(({
	theme: {
		palette: {
			primary,
			error: errorPalette,
		}
	},
	error,
	isDragActive,
}) => ({
	$strokeWidth: 2,
	$dashSize: 5,
	$gapSize: 5,
	$zeroPadding: true,
	$strokeColor: dropZoneColors(primary.main, primary.dark, errorPalette.main)({ error, isDragActive }),
}))`
	${({ theme: { palette: { primary, secondary, error } } }) => css`
		background-color: ${dropZoneColors(primary.contrast, primary.lightest, error.lightest)};
		color: ${dropZoneColors(secondary.main, secondary.main, error.main)};
	`}

	cursor: ${(props: any) => props.error ? 'default' : 'pointer' };
	position: relative;
	padding: 10px;
	text-align: center;
	transition: background-color 0.3s ease,color 0.3s ease,border-color 0.3s ease ;
` as any;
