/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { Accordion as AccordionBase } from '@controls/accordion/accordion.component';
import { TableVirtuoso } from 'react-virtuoso';

export const Accordion = styled(AccordionBase)`
	&& {
		.MuiAccordionDetails-root {
			padding: 0;

			& > :not(:first-child) {
				margin-top: 0;
			}
		}
	}
`;

export const Comments = styled.div`
	height: 400px;
`;

export const VirtualisedList = styled(TableVirtuoso)`
	box-sizing: border-box;
	overflow-x: hidden;

	table {
		display: flex;
		justify-content: center;
		margin-right: -16px;

		tr {
			display: flex;
			flex-direction: column;
		}
	}
`;

export const EmptyCommentsBox = styled.div`
	padding: 15px;
`;
