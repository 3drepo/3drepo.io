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

import Grid from '@mui/material/Grid';
import styled from 'styled-components';

import { ellipsis, COLOR } from '../../../styles';
import { TREE_LEVELS } from './treeList.component';

const isActive = ({ active, disabled }) => active && !disabled;

interface IContainer {
	active?: boolean;
	disabled?: boolean;
	disableShadow?: boolean;
	level?: number;
}

export const Headline = styled.div<IContainer>`
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding-left: 24px;
	padding-right: 13px;
	${({ active, level }) => (active || level === TREE_LEVELS.PROJECT) && `background: ${COLOR.WHITE}`};
	min-height: ${({ level }) => (level === TREE_LEVELS.TEAMSPACE) ? '65px' : '50px'};
`;

export const Details = styled.div<IContainer>`
	transition: all 200ms ease-in-out;
	background: ${({ active }) => active ? COLOR.WHITE : 'transparent'};
	box-shadow: 0 12px 30px ${({ disableShadow }) => disableShadow ? 'none' : 'currentColor'};
`;

const getShadowColor = ({ active, disableShadow }) => active && !disableShadow ? 'currentColor' : 'transparent';

export const Container = styled.div<IContainer>`
	overflow: hidden;
	border-bottom: 1px solid ${COLOR.BLACK_6};
	background: ${({ active }) => active ? COLOR.GRAY : 'rgba(250, 250, 250)'};
	box-shadow: inset 0 -15px 30px -27px ${({ active, disableShadow }) => getShadowColor({ active, disableShadow })};
	transition: background 150ms ease-in-out;
	color: ${({ disabled }) => disabled ? COLOR.BLACK_30 : COLOR.BLACK_60};
	user-select: none;
	position: relative;

	& > ${Headline} {
		padding-left: ${({ level }) => (level || 0) * 24}px;
	}

	& > ${/* sc-selector */ Headline}:hover {
		background: ${({ active, disabled }) => isActive({ active, disabled }) ? 'transparent' : COLOR.WHITE};
	}

	width: calc(100% - 1px);
`;

export const HeadlineContainer = styled(Grid)`
	padding-left: 24px;
`;

export const Title = styled.div`
	font-size: 14px;
	${ellipsis('100%')}
`;

export const IconContainer = styled.div`
	margin-right: 12px;
	display: flex;
`;

export const ChildrenContainer = styled.div`
	font-size: 14px;
	display: flex;
	flex-direction: row;
	align-items: center;
`;
