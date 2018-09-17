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
import TableSortLabel from '@material-ui/core/TableSortLabel';
import { memoize } from 'lodash';

import { COLOR, FONT_WEIGHT } from '../../../styles';

import * as JobItem from '../jobItem/jobItem.styles';
import * as UserItem from '../userItem/userItem.styles';
import * as CellSelect from './components/cellSelect/cellSelect.styles';

const flexMemoized = memoize(({flex}) => {
	if (flex === 100) {
		return `1 1 100%`;
	}

	return flex ? `1 0 100%` : 'none';
}, ({flex}) => flex);

export const SortLabel = styled(TableSortLabel)`
	&& {
		flex-direction: row-reverse;
		font-weight: ${FONT_WEIGHT.SEMIBOLD};
		margin-left: ${({active}) => active ? 0 : '-5px'};
	}

	&::before {
		width: 18px;
		height: 18px;
		left: -2px;
		border-radius: 100%;
		position: absolute;
		top: -1px;
		transition: 200ms ease-in-out;
		content: '';
		background: ${({active}) => active ? '#15563c' : 'transparent'};
	}

	svg {
		opacity: 1;
		margin-left: 0;
		margin-right: 10px;
		width: 14px;
		height: 14px;
		fill: ${({active}) => active ? COLOR.WHITE : COLOR.BLACK_60};
	}
`;

export const Cell = styled.div`
	overflow: hidden;
	white-space: nowrap;
	display: flex;
	box-sizing: border-box;
	justify-content: flex-start;
	align-items: center;
	padding: 0 24px;

	flex: ${flexMemoized};
	max-width: ${(props: any) => props.flex ? `${props.flex}%` : 'initial'};
	width: ${(props: any) => props.width || 'auto'};
`;

export const Container = styled.div`
	&& {
		overflow: hidden;
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	${UserItem.Name},
	${CellSelect.StyledSelect},
	${SortLabel},
	${Cell} {
		color: ${COLOR.BLACK_60};
		font-size: 14px;
	}

	${CellSelect.StyledSelect}:after,
	${CellSelect.StyledSelect}:before {
		display: none;
	}
`;

export const Row = styled.div`
	height: 62px;
	display: flex;
	flex-direction: row;
	border-bottom: 1px solid ${COLOR.BLACK_6};
`;

export const Head = styled(Row)`
	flex: none;
`;
