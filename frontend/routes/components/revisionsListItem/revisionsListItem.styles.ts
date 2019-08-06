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

import ListItem from '@material-ui/core/ListItem';
import styled from 'styled-components';
import { COLOR, FONT_WEIGHT } from '../../../styles';

interface IContainer {
	theme: {
		isCurrent?: boolean;
		isVoid?: boolean;
	};
}

export const ActionsMenuWrapper = styled.div`
	display: flex;
	margin-left: 20px;
	margin-top: -12px;
	margin-right: -12px;
`;

export const Property = styled.div`
	width: 'auto';

	font-weight: ${({ active }) => active ? FONT_WEIGHT.SEMIBOLD : FONT_WEIGHT.LIGHTER};
`;

export const Tag = styled.div`
	width: 160px;
`;

export const PropertyWrapper = styled.div`
	display: flex;

	${Property} {
		margin-right: 30px;
	}
`;

const getItemBackgroundColor = (theme) => {
	if (theme.isCurrent) {
		return COLOR.WHITE;
	}

	if (theme.isVoid) {
		return COLOR.WARNING_LIGHT;
	}

	return COLOR.BLACK_6;
};

const getItemHoverBackgroundColor = (theme) => {
	if (theme.isCurrent) {
		return COLOR.LIGHT_GRAY;
	}

	if (theme.isVoid) {
		return COLOR.WARNING;
	}

	return COLOR.BLACK_12;
};

export const Container = styled(ListItem)<IContainer>`
	display: flex;
	flex-direction: column;
	border-bottom: 1px solid ${COLOR.BLACK_20};
	color: ${({ theme }) => theme.isVoid ? COLOR.BLACK_40 : COLOR.BLACK};
	font-size: 14px;

	&& {
		cursor: pointer;
		justify-content: space-between;
		padding: 24px;
		background-color: ${({ theme }) => getItemBackgroundColor(theme)};
		border-bottom: 1px solid ${COLOR.BLACK_20};
		transition: background-color 0.25s ease-in-out;

		&:hover {
			background-color: ${({ theme }) => getItemHoverBackgroundColor(theme)};
		}
	}
`;

export const Row = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	justify-content: space-between;
`;

export const Column = styled.div`
	display: flex;
	flex-direction: column;
	align-self: flex-start;
	margin-top: 8px;
`;

export const Description = styled.div`
	color: ${COLOR.BLACK_40};
	align-self: flex-start;
	margin-top: 8px;
`;
