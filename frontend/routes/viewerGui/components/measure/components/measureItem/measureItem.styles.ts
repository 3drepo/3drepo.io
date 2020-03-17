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

import {cond, constant, matches, stubTrue} from 'lodash';
import styled, { css } from 'styled-components';

import { TREE_ITEM_FEDERATION_TYPE, TREE_ITEM_MODEL_TYPE, TREE_ITEM_SIZE } from '../../../../../../constants/tree';
import { COLOR } from '../../../../../../styles';
import { ColorSelect } from '../../../../../components/colorPicker/colorPicker.styles';

interface IContainer {
	nodeType: string;
	expandable: boolean;
	selected: boolean;
	highlighted: boolean;
	expanded: boolean;
	level: number;
	active: boolean;
	hasFederationRoot: boolean;
}

const getBackgroundColor = (props) => {
	if (props.highlighted) {
		return '#B6C4DE';
	} else if (props.selected) {
		return '#D8E6FF';
	}

	switch (props.nodeType) {
		case TREE_ITEM_FEDERATION_TYPE:
			return  COLOR.GRAY_50;
			break;
		case TREE_ITEM_MODEL_TYPE:
			return COLOR.GRAY;
			break;
		default:
			return COLOR.WHITE;
	}
};

const containerIndentation = cond([
	[matches({ nodeType: TREE_ITEM_FEDERATION_TYPE }), constant(38)],
	[matches({ nodeType: TREE_ITEM_MODEL_TYPE }), constant(20)],
	[stubTrue, ({ level, hasFederationRoot }) => {
		const indentation = level * 10;
		return !hasFederationRoot ? indentation + 10 : indentation;
	}]
]);

export const MeasurementValue = styled.div`
	width: 120px;
	text-align: right;
	padding-right: 10px;
`;

export const Actions = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	align-self: center;

	${ColorSelect} {
		width: auto;
		border-bottom: none;
	}
`;

const containerBorder = css`
	border: 1px solid ${COLOR.DARK_GRAY};
	border-left-color: transparent;
	border-top-color: transparent;
	border-right-color: transparent;

	${({ active }: any) => active ? 'border-color: #757575' : ''};
`;

export const Container = styled.li<IContainer>`
	${containerBorder};
	background-color: ${getBackgroundColor};
	padding: 2px 12px 2px ${containerIndentation}px;
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: ${TREE_ITEM_SIZE}px;
	box-sizing: border-box;
	cursor: pointer;
`;
