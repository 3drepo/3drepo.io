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

import DialogContent from '@material-ui/core/DialogContent';
import FormControl from '@material-ui/core/FormControl';
import TableCell from '@material-ui/core/TableCell';
import { Field } from 'formik';
import styled from 'styled-components';
import { CustomTable } from '../../../components/customTable/customTable.component';

export const StyledField = styled(Field)`
	margin-right: 10px;
`;

export const SelectWrapper = styled(FormControl)`
	&&:not(:first-child) {
		margin-top: 15px;
	}
`;

export const FieldWrapper = styled(FormControl)``;

export const StyledCustomTable = styled(CustomTable)`
	width: 100%;
`;

export const Row = styled.div`
	display: flex;
	flex-direction: row;
	min-width: 480px;

	${FieldWrapper} {
		margin-right: 10px;
		width: 100%;
	}

	${SelectWrapper} {
		margin-left: 10px;
	}
`;

export const HeaderCheckboxWrapper = styled.div`
	display: flex;
	align-items: center;
`;

export const HeaderCell = styled(TableCell)`
	&& {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}
`;

export const StyledDialogContent = styled(DialogContent)`
	&& {
		max-height: 60vh !important;
		margin-bottom: 24px;
		padding-bottom: 0;
	}
`;
