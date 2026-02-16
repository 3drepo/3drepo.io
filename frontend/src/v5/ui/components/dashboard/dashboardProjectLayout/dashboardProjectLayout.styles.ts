/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { FOOTER_HEIGHT } from '@components/shared/dashboardFooter/dashboardFooter.styles';
import styled from 'styled-components';

export const OuterContainer = styled.div`
	background-color: ${({ theme }) => theme.palette.tertiary.lightest};
	overflow-y: auto;
	flex-grow: 1;
	display: grid;
	grid-template-columns: 100%;
	grid-template-rows: auto ${FOOTER_HEIGHT}px;
`;

export const InnerContainer = styled.div`
	padding: 18px 75px;
`;
