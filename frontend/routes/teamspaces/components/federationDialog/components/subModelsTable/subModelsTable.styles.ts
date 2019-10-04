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
import { COLOR } from '../../../../../../styles';

import Checkbox from '@material-ui/core/Checkbox';
import Table from '@material-ui/core/Table';
import TableCellComponent from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRowComponent from '@material-ui/core/TableRow';

export const HeaderCheckboxWrapper = styled.div`
	display: flex;
	align-items: center;
`;

export const HeaderCell = styled(TableCellComponent)`
	&& {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: auto;
	}
`;

export const StyledCheckbox = styled(Checkbox)`
	&& {
		padding: 0 12px 0 0;
	}
`;

export const StyledTable = styled(Table)`
	&& {
		width: 50%;
	}

	td {
		border-bottom: none;
	}

	&:first-of-type {
		tbody {
			border-right: 1px solid ${COLOR.BLACK_20}
		}
	}
	&:last-of-type {
		${StyledCheckbox} {
			padding: 0 12px;
		}
	}
`;

export const StyledTableHead = styled(TableHead)`
	tr {
		height: auto;
	}
`;

export const ModelName = styled.span`
	word-break: break-word;
`;

export const TableCell = styled(TableCellComponent)`
	&& {
		display: flex;
		align-items: center;
	}
`;

export const TableRow = styled(TableRowComponent)`
	&& {
		display: flex;
		align-items: center;
	}
`;
