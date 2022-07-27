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

import { isV5 } from '@/v4/helpers/isV5';
import { cond, constant, isEqual, matches, stubTrue } from 'lodash';
import styled, { css } from 'styled-components';
import {
	TREE_ITEM_FEDERATION_TYPE,
	TREE_ITEM_MODEL_TYPE,
	TREE_ITEM_OBJECT_TYPE,
	TREE_ITEM_SIZE
} from '../../../../../../constants/tree';
import { COLOR } from '../../../../../../styles';

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

interface IName {
	nodeType: string;
}

interface IExpandableButton {
	nodeType?: string;
	hasChildren: boolean;
	expanded: boolean;
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

const containerIndentation = cond([
	[matches({ nodeType: TREE_ITEM_FEDERATION_TYPE }), constant(isV5() ? 15 : 38)],
	[matches({ nodeType: TREE_ITEM_MODEL_TYPE }), constant(isV5() ? 15 : 20)],
	[stubTrue, ({ level, hasFederationRoot }) => {
		const INDENTATION_STEP = isV5() ? 8 : 10;
		const indentation = level * INDENTATION_STEP;
		return !hasFederationRoot ? indentation + INDENTATION_STEP : indentation;
	}]
]);

export const Actions = styled.div`
	align-self: center;
	display: none;
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
	flex: none;
	justify-content: center;

	&:focus {
		outline: none;
	}

	svg {
		font-size: 16px;
	}

	${({ theme, hasChildren, expanded }) => isV5() && hasChildren && `
		background-color: ${expanded ? theme.palette.secondary.main : theme.palette.base.main};
	`}
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
	cursor: inherit;

	&:hover ${Actions} {
		display: block;
	}
	${({ active }: any) => active ? css`
		${Actions} {
			display: block;
		}
	` : ''};

	${({ theme: { palette }, nodeType, active, expandable }) => isV5() && css`
		/* TODO - fix after new palette is released */
		background-color: ${active ? '#F7F8FA' : palette.primary.contrast};
		border: none;
		color: ${active ? palette.primary.main : palette.base.main};
		${(nodeType === TREE_ITEM_MODEL_TYPE) && `
			border-top: 1px solid ${palette.base.lightest};
		`};

		${StyledExpandableButton} {
			${expandable ? css`
				background-color: ${active ? palette.primary.main : palette.secondary.main};
			}` : css`
				color: inherit;
				background-color: transparent;
			`
		}
	`}
`;

export const Name = styled.div<IName>`
	align-self: center;
	font-size: 13px;
	margin-left: 12px;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const NameWrapper = styled.div`
	display: flex;
	overflow: hidden;
	flex: 1;
`;

export const ParentOfVisible = styled.span`
	color: ${COLOR.LIGHT_BLUE};
	display: flex;
`;
