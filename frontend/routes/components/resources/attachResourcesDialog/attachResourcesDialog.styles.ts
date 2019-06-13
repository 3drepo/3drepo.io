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

import { DialogContent, Divider, InputAdornment, Typography } from '@material-ui/core';
import styled from 'styled-components';
import Dropzone from 'react-dropzone';
import * as React from 'react';
import { COLOR } from '../../../../styles';

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
		padding-top:4px;
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

export const ExtensionAdornment =  styled((props) => {
	return React.createElement(InputAdornment,  {...props, position: 'end'});
})`
	p {
		font-weight: bold;
		font-family: courier;
	}
`;

export const DropzoneContent = styled.div`
	cursor: pointer;
	background-color: ${(props: any) => props.isDragActive ? 'azure' : 'transparent' };
	position: relative;
	padding: 10px;
	border-width: 3px;
	border-color:  ${(props: any) => !props.isDragActive ? COLOR.BLACK_50 : 'rgba(0, 0, 120, 0.5)' } ;
	color:  ${(props: any) => !props.isDragActive ? COLOR.BLACK_60 : 'rgba(0, 0, 120, 0.6)' } ;
	border-style: dashed;
	border-radius: 5px;
	text-align: center;
` as any;
