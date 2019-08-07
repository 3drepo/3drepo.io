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

import { Button as ButtonComponent, ListItem } from '@material-ui/core';
import styled from 'styled-components';
import { COLOR, FONT_WEIGHT } from '../../../styles';

export const ActionsMenuWrapper = styled.div`
	display: flex;
	margin-left: 20px;
	margin-top: -12px;
	margin-right: -12px;
`;

export const Property = styled.div`
	width: 'auto';
`;

export const FileType = styled(Property)`
	margin-top: 8px;
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

export const Toolbar = styled.div`
	display: flex;
	align-items: center;
	justify-content: flex-end;
	width: 100%;
	height: 26px;
	margin-top: 12px;
`;

export const Button = styled(ButtonComponent).attrs({
	color: 'secondary'
})`
	&& {
		padding: 8px;
	}
	&:last-child {
		margin-right: -8px;
	}
`;

const getItemBackgroundColor = (props) => {
	if (props.current) {
		return COLOR.WHITE;
	}

	if (props.void) {
		return COLOR.WARNING_LIGHT;
	}

	return COLOR.BLACK_6;
};

const getItemHoverBackgroundColor = (props) => {
	if (props.current) {
		return COLOR.LIGHT_GRAY;
	}

	if (props.void) {
		return COLOR.WARNING;
	}

	return COLOR.BLACK_12;
};

export const Container = styled(ListItem)`
	display: flex;
	flex-direction: column;
	border-bottom: 1px solid ${COLOR.BLACK_20};
	color: ${({ theme }) => theme.isVoid ? COLOR.BLACK_40 : COLOR.BLACK};
	font-size: 14px;
	font-weight: ${({ current }) => current ? FONT_WEIGHT.SEMIBOLD : FONT_WEIGHT.NORMAL};

	&& {
		cursor: pointer;
		justify-content: space-between;
		padding: 18px 24px;
		background-color: ${getItemBackgroundColor};
		border-bottom: 1px solid ${COLOR.BLACK_20};
		transition: background-color 0.25s ease-in-out;

		&:hover {
			background-color: ${getItemHoverBackgroundColor};
		}
	}
`;

export const Row = styled.div`
	display: flex;
	flex-direction: row;
	width: 100%;
	justify-content: space-between;
`;

export const Description = styled.div`
	color: ${COLOR.BLACK_40};
	align-self: flex-start;
	margin-top: 8px;
`;
