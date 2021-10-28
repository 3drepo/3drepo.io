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

import Grid from '@material-ui/core/Grid';
import styled from 'styled-components';

import { COLOR } from '../../styles';
import * as CustomTable from '../components/customTable/customTable.styles';

export const Container = styled(Grid)`
	min-width: 0;
	height: 100%;
	overflow: hidden;
`;

export const ModelsContainer = styled(Grid)`
	border-right: 1px solid ${COLOR.BLACK_6};
	flex: 1 1 100%;
	max-width: 30%;
	min-width: 300px;
	position: relative;

	${CustomTable.Cell} {
		max-width: calc(100% - 50px);
	}
`;

export const PermissionsContainer = styled(Grid)`
	flex: 1;
	overflow: hidden;
	position: relative;

	${CustomTable.Container} {
		min-width: 780px;
	}

	${CustomTable.Body} {
		overflow: hidden;
		flex: 1;
	}
`;

export const OverflowWrapper = styled.div`
	height: 100%;

	& > [data-simplebar=init] {
		min-height: 100%;
		height: inherit !important;

		& > .simplebar-scroll-content > .simplebar-content {
			height: 100% !important;
		}
	}
`;
