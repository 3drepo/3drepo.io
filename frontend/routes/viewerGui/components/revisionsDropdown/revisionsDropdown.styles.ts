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

export const Container = styled.div`
	z-index: 2;
	position: absolute;
	color: white;
	text-shadow: 1px 1px #666666;
	font-size: 14px;
	width: 250px;
	top: 60px;
	left: 50%;
	font-weight: bold;
	margin-left: -125px;
	text-align: center;

	@media (max-width: 767px) {
    revisions {
        top: 10px;
        left: 45%;
    }
	}
`;
