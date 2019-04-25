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
import { cond, matches, isEqual, constant, stubTrue, memoize } from 'lodash';
import { COLOR } from '../../../../../../styles';
import {
	TREE_ITEM_FEDERATION_TYPE,
	TREE_ITEM_MODEL_TYPE,
	TREE_ITEM_OBJECT_TYPE
} from '../../../../../../constants/tree';

interface IContainer {
	nodeType: string;
	expandable: boolean;
	selected: boolean;
	highlighted: boolean;
	expanded: boolean;
	level: number;
}

interface IName {
	nodeType: string;
}

interface IExpandableButton {
	nodeType?: string;
	hasChildren: boolean;
	expanded: boolean;
}

const getBackgroundColor = (props) => cond([
		[matches(TREE_ITEM_FEDERATION_TYPE), constant(COLOR.GRAY_60)],
		[matches(TREE_ITEM_MODEL_TYPE), constant(COLOR.GRAY)],
		[matches(TREE_ITEM_OBJECT_TYPE), () => {
				if (props.highlighted) {
					return '#D8E6FF';
				} else if (props.selected) {
					return '#F4F8FF';
				}
				return COLOR.WHITE;
			}
		]
	])(props.nodeType);

const getBoxShadow = (props) => {
	if (props.expanded && isEqual(TREE_ITEM_MODEL_TYPE, props.nodeType)) {
		return `inset 0px -12px 12px -10px ${COLOR.BLACK_20}`;
	} else if (props.highlighted) {
		return `inset 0px 0px 0px 1px #757575`;
	}
	return 'none';
};

const getButtonBackgroundColor = (props) => {
	if (props.hasChildren) {
		if (isEqual(TREE_ITEM_OBJECT_TYPE, props.nodeType)) {
			return COLOR.PRIMARY_DARK;
		} else {
			return COLOR.BLACK_60;
		}
	}
	return 'transparent';
};

const getPaddingLeft = cond([
	[matches({ level: 0 }), constant(0)],
	[matches({ level: 1 }), constant(38)],
	[stubTrue, ({ level }) => level * 10]
]);

export const Container = styled.li<IContainer>`
	cursor: ${(props) => isEqual(TREE_ITEM_FEDERATION_TYPE, props.nodeType) ? 'default' : 'pointer'};
	border-bottom: ${(props) => props.highlighted ? 'none' : `1px solid ${COLOR.DARK_GRAY}`};
	background-color: ${getBackgroundColor};
	padding-left: ${getPaddingLeft}px;
	padding-top: 2px;
	padding-bottom:2px;
	padding-right: 12px;
	box-shadow: ${getBoxShadow};
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 40px;
`;

export const Name = styled.div<IName>`
	align-self: center;
	font-size: 13px;
	margin-left: 12px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 260px;
`;

export const StyledExpandableButton = styled.button<IExpandableButton>`
    background-color: ${getButtonBackgroundColor};
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
