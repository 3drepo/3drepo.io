/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { Link } from 'react-router-dom';
import { UsernameField } from '../login.styles';

export const Input = styled(UsernameField)`
	margin-bottom: 7px;
`;

export const RequestSentMessage = styled.div`
	margin: 22px 0;
	color: ${({ theme }) => theme.palette.base.main};
`;

export const ReturnLink = styled(Link)`
	display: flex;
	margin: 22px auto 12px;
	justify-content: center;
	color: ${({ theme }) => theme.palette.primary.main};
`;
