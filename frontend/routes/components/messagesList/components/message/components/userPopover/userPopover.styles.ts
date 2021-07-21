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

import { COLOR } from '../../../../../../../styles';

export const AvatarWrapper = styled.div`
	display: flex;
	align-items: center;
`;

export const Container = styled.div`
	padding: 10px;
	display: flex;
`;

export const UserData = styled.div`
	margin-left: 10px;
	margin-right: 10px;
	overflow: hidden;
`;

export const Name = styled.span`
	font-size: 12px;
`;

export const Details = styled.p`
	color: ${COLOR.BLACK_40};
	font-size: 10px;
	margin-top: 0;
	margin-bottom: 2px;
	white-space: nowrap;
	text-overflow: ellipsis;
	overflow: hidden;
`;
