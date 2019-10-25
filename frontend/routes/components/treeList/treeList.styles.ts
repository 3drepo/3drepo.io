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

import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';

import { ellipsis, COLOR } from '../../../styles';
import { TREE_LEVELS } from './treeList.component';

const isActive = (props) => props.active && !props.disabled;

export const Headline = styled.div`
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	padding-left: 24px;
	padding-right: 13px;
	background: ${(props) => props.active || props.level === TREE_LEVELS.PROJECT && COLOR.WHITE};
	min-height: ${(props) => (props.level === TREE_LEVELS.TEAMSPACE) ? '65px' : '50px'};
`;

export const Details = styled.div`
	transition: all 200ms ease-in-out;
	background: ${(props: any) => props.active ? COLOR.WHITE : 'transparent'};
	box-shadow: 0 12px 30px ${(props: any) => props.disableShadow ? 'none' : 'currentColor'};
`;

interface IContainer {
	active: boolean;
	disabled: boolean;
	disableShadow: boolean;
}

const getShadowColor = (props) => props.active && !props.disableShadow ? 'currentColor' : 'transparent';

export const Container = styled.div<IContainer>`
	overflow: hidden;
	border-bottom: 1px solid ${COLOR.BLACK_6};
	background: ${(props) => props.active ? COLOR.GRAY : 'rgba(250, 250, 250)'};
	box-shadow: inset 0 -15px 30px -27px ${getShadowColor};
	transition: background 150ms ease-in-out;
	color: ${(props) => props.disabled ? COLOR.BLACK_30 : COLOR.BLACK_60};
	user-select: none;
	position: relative;

	& > ${Headline} {
		padding-left: ${(props) => (props.level || 0) * 24}px;
	}

	& > ${/* sc-selector */ Headline}:hover {
		background: ${(props) => isActive(props) ? 'transparent' : COLOR.WHITE};
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
