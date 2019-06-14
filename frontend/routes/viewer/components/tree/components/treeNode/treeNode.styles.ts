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
import { cond, matches, isEqual } from 'lodash';
import { COLOR } from '../../../../../../styles';
import {
	TREE_ITEM_FEDERATION_TYPE,
	TREE_ITEM_MODEL_TYPE,
	TREE_ITEM_OBJECT_TYPE
} from '../../../../../../constants/tree';

interface IContainer {
	type: string;
	collapsable: boolean;
	selected: boolean;
	highlighted: boolean;
	collapsed: boolean;
	level: number;
}

interface IName {
	type: string;
}

interface ICollapseButton {
	hasChildren: boolean;
	collapsed: boolean;
}

const getBackgroundColor = (props) => cond([
		[matches(TREE_ITEM_FEDERATION_TYPE), () => COLOR.GRAY_60],
		[matches(TREE_ITEM_MODEL_TYPE), () => COLOR.GRAY],
		[matches(TREE_ITEM_OBJECT_TYPE), () => {
				if (props.selected) {
					return '#F4F8FF';
				} else if (props.highlighted) {
					return '#D8E6FF';
				}
				return COLOR.WHITE;
			}
		]
	])(props.type);

const getBoxShadow = (props) => {
	if (!props.collapsed && isEqual(TREE_ITEM_MODEL_TYPE, props.type)) {
		return `inset 0px -12px 12px -10px ${COLOR.BLACK_20}`;
	} else if (props.highlighted) {
		return `inset 0px 0px 0px 1.5px #757575`;
	}
	return 'none';
};

export const Container = styled.li<IContainer>`
	cursor: ${(props) => isEqual(TREE_ITEM_FEDERATION_TYPE, props.type) ? 'default' : 'pointer'};
	border-bottom: 1px solid ${COLOR.DARK_GRAY};
	background-color: ${(props) => getBackgroundColor(props)};
	padding-left: ${(props) => props.level > 1 ? `${props.level * 12}px` : '42px'};
	padding-top: ${(props) => isEqual(TREE_ITEM_OBJECT_TYPE, props.type) ? '2px' : '6px'};
	padding-bottom: ${(props) => isEqual(TREE_ITEM_OBJECT_TYPE, props.type) ? '2px' : '6px'};
	min-height: 40px;
	padding-right: 12px;
	box-shadow: ${(props) => getBoxShadow(props)};
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

export const Name = styled.div<IName>`
	align-self: center;
	font-size: ${(props) => isEqual(TREE_ITEM_OBJECT_TYPE, props.type) ? '13px' : '16px'};
	margin-left: 12px;
`;

const getButtonBackgroundColor = (props) => {
	if (props.hasChildren) {
		if (isEqual(TREE_ITEM_OBJECT_TYPE, props.type)) {
			return COLOR.PRIMARY_DARK;
		} else {
			return COLOR.BLACK_60;
		}
	}
	return 'transparent';
};

export const StyledCollapseButton = styled.button<ICollapseButton>`
    background-color: ${(props) => getButtonBackgroundColor(props)};
    border-radius: 3px;
    color: ${(props) => props.hasChildren ? COLOR.WHITE : COLOR.PRIMARY_DARK};
		border: none;
    width: 18px;
    height: 18px;
    display: flex;
    margin: 0;
    padding: 0;
    justify-content: center;

		&:focus {
			outline: none;
		}

		svg {
			font-size: 16px;
		}
`;

export const NameWrapper = styled.div`
	display: flex;
`;

export const Actions = styled.div`
	align-self: center;
`;
