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

import { ButtonBase, ListItem } from '@mui/material';
import styled, { css } from 'styled-components';
import { COLOR, FONT_WEIGHT } from '../../../styles';

export const Property = styled.div`
	display: flex;
	align-items: center;

	svg {
		margin-left: -3px;
		margin-right: 6px;
	}
`;

export const FileType = styled(Property)``;

export const Tag = styled.div`
	width: 160px;
`;

export const PropertyWrapper = styled.div`
	display: flex;

	${Property} {
		margin-right: 30px;
	}
`;

export const Description = styled.div`
	color: ${COLOR.BLACK_40};
	align-self: flex-start;
	width: 100%;
	margin-top: 5px;
`;

interface IStateTheme {
	isVoid?: boolean;
	current?: boolean;
	isPending?: boolean;
}

export const Container = styled(ListItem)<IStateTheme>`
	display: flex;
	flex-direction: column;
	border-bottom: 1px solid ${COLOR.BLACK_20};
	color: ${({ isVoid, isPending }) => isVoid || isPending ? COLOR.BLACK_20 : COLOR.BLACK};
	font-size: 14px;
	font-weight: ${({ current }) => current ? FONT_WEIGHT.SEMIBOLD : FONT_WEIGHT.NORMAL};

	&& {
		justify-content: space-between;
		padding: 18px 24px;
		background-color: ${({ current }) => current ? COLOR.WHITE_87 : COLOR.BLACK_6};
		border-bottom: 1px solid ${COLOR.BLACK_20};
		transition: background-color 0.25s ease-in-out;

		&:hover {
			background-color: ${COLOR.BLACK_12};
		}
	}

	${Description} {
		${({ isVoid, isPending }) => isVoid || isPending ? css`
			color: ${COLOR.BLACK_20};
		` : ''}
	}
`;

export const Row = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	justify-content: space-between;
	align-items: center;

	&:not(:last-child) {
		margin-bottom: 8px;
	}
`;

const StyledButtonBase = styled(ButtonBase)<IStateTheme>`
	&& {
		font-size: 14px;
		color: ${COLOR.WHITE};
		background-color: ${({ isVoid }) => !isVoid ? COLOR.SECONDARY_MAIN : COLOR.BLACK_30};
		cursor: pointer;
		box-sizing: border-box;
		height: 20px;
		padding: 0 10px;
		border-radius: 10px;
		white-space: nowrap;

		&:disabled {
			background-color: ${({ isVoid }) => !isVoid ? COLOR.SECONDARY_MAIN_54 : COLOR.BLACK_16};
			cursor: default;
		}
	}
`;

export const ToggleButton = styled(StyledButtonBase)`
	&& {
		width: 80px;
	}
`;

export const LinkWrapper = styled.span`
	margin-left: 10px;
`;

export const LoaderContainer = styled.div`
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
`;
