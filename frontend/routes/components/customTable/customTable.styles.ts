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
import { memoize } from 'lodash';

import { COLOR, FONT_WEIGHT, isWindows, isFirefox } from '../../../styles';

import * as UserItem from '../userItem/userItem.styles';
import * as CellSelect from './components/cellSelect/cellSelect.styles';

const flexMemoized = memoize(({flex}) => {
	if (flex === 100) {
		return `1 1 100%`;
	}

	return flex ? `1 0 100%` : 'none';
}, ({flex}) => flex);

export const Cell = styled.div`
	overflow: hidden;
	white-space: nowrap;
	display: flex;
	box-sizing: border-box;
	justify-content: flex-start;
	align-items: center;
	padding: ${(props: any) => props.padding || '0 24px'};
	flex: ${flexMemoized};
	max-width: ${(props: any) => props.flex ? `${props.flex}%` : 'initial'};
	width: ${(props: any) => props.width || 'auto'};
`;

export const CheckboxCell = styled(Cell)`
	overflow: visible;
	padding: 0 0 0 12px;
`;

export const Container = styled.div`
	&& {
		overflow: hidden;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	${UserItem.Name},
	${/* sc-selector */ CellSelect.StyledSelect},
	${Cell} {
		color: ${COLOR.BLACK_60};
		font-size: 14px;
	}

	${/* sc-selector */ CellSelect.StyledSelect}:after,
	${/* sc-selector */ CellSelect.StyledSelect}:before {
		display: none;
	}
`;

export const Row = styled.div`
	height: 62px;
	display: flex;
	flex-direction: row;
	border-bottom: 1px solid ${COLOR.BLACK_6};
	cursor: ${(props: any) => props.clickable ? 'pointer' : 'initial'};
`;

export const Head = styled(Row)`
	flex: none;

	${Cell} {
		font-weight: ${FONT_WEIGHT.SEMIBOLD};
	}
`;

export const Body = styled.div`
	height: inherit;
	overflow: hidden;
	position: absolute;
	width: 100%;

	[data-simplebar='init'] {
		height: 100%;
	}

	${isWindows(isFirefox(`
		.simplebar-content {
			padding-bottom: 34px !important;
		}
	`))}
`;

export const BodyWrapper = styled.div`
	width: 100%;
	position: relative;
	height: inherit;
`;
