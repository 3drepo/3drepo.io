/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';

import { COLOR } from '../../../styles';
import { FileUploadInvoker } from '../../viewerGui/components/commentForm/commentForm.styles';

export const MenuList = styled(List)`
	background-color: ${COLOR.WHITE};
	width: 100%;
	box-shadow: 0 1px 3px 0 ${COLOR.BLACK_20};
	border-radius: 2px;

	&& {
		padding-top: 4px;
		padding-bottom: 4px;
	}
`;

export const NestedWrapper = styled.li`
	position: relative;
`;

export const StyledItemText = styled.div`
	color: ${COLOR.BLACK_60};
	font-size: 12px;
	display: flex;
	justify-content: space-between;
	width: 100%;
	align-items: center;
`;

export const IconWrapper = styled.div`
	color: ${COLOR.BLACK_60};
	font-size: 12px;
	margin-right: 10px;
`;

export const StyledListItem = styled(ListItemButton)`
	&& {
		padding: 4px 10px;
		height: 30px;
		min-width: 180px;

		${FileUploadInvoker} {
			display: none;
		}
	}
`;

const getDirection = ({ left = false }) => left ? 'right: 100%' : 'left: 100%';

export const Wrapper = styled.div<{ top: number, left?: boolean }>`
	background-color: ${COLOR.WHITE};
	position: absolute;
	top: 0;
	z-index: 1;
	min-width: 160px;
	max-width: 400px;
	width: 100%;
	box-shadow: 1px 1px 3px 0 ${COLOR.BLACK_20};
	border-radius: 0 2px 2px 0;
	${getDirection};
	max-height: ${({ top }) => `calc(100vh - ${top}px - 25px)`};
	overflow: auto;
`;
