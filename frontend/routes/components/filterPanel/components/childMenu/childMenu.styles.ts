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

import styled from 'styled-components';

import { COLOR } from '../../../../../styles';

const getDirection = ({ left }) => left ? 'right: 100%' : 'right: 100%';

export const Wrapper = styled.div`
	background-color: ${COLOR.WHITE};
	position: absolute;
	top: 0;
	z-index: 1;
	min-width: 160px;
	max-width: 400px;
	width: 100%;
	box-shadow: 1px 1px 3px 0 ${COLOR.BLACK_20};
	border-radius: 0 2px 2px 0;
	${getDirection};
	max-height: ${(props: any) => `calc(100vh - ${props.top}px - 25px)`};
	overflow: auto;
`;
