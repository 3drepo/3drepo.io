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
import ErrorIconBase from '@assets/icons/warning_small.svg';

export const Container = styled.div`
	color: ${({ theme }) => theme.palette.error.main};
	${({ theme }) => theme.typography.body1};
	font-weight: 500;
	margin-top: 13px;
	justify-content: flex-start;
	display: flex;
`;

export const ErrorIcon = styled(ErrorIconBase)`
	margin-right: 8px;
	min-width: 18px;
`;

export const Message = styled.div`
	margin-left: 8px;
`;
