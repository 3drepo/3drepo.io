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
import styled from 'styled-components';

import { DateField } from '../dateField/dateField.component';

export const SequenceDateContainer = styled.div`
	display: flex;
	justify-content: space-between;

	& .MuiFormControl-root {
		width: 190px;
	}
`;

export const SequenceDateField = styled(DateField)`
	&& {
		display: inline-block;
		& .MuiInputBase-formControl {
			margin-top: 0;
		}
	}
`;

export const SequenceDateActions = styled.div`
	top: 13px;
	right: 151px;
	position: relative;
	display: flex;
`;
