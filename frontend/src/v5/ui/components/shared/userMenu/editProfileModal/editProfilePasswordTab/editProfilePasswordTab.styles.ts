/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { SubmitButton } from '@controls/submitButton';
import styled from 'styled-components';

export const Button = styled(SubmitButton)`
	margin-bottom: 0;
	width: fit-content;
`;

export const Title = styled.div`
	${({ theme }) => theme.typography.caption};
	color: ${({ theme }) => theme.palette.base.main};
	font-size: 11px;
`;
