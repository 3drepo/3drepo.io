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

import { InputLabel } from '@mui/material';
import styled from 'styled-components';
import { InputContainer as InputContainerBase } from '@controls/inputs/inputContainer/inputContainer.styles';

export const InputContainer = styled(InputContainerBase)`
	padding: 13px;
`;

export const Label = styled(InputLabel)`
	${({ theme }) => theme.typography.h5}
	color: inherit;
	max-width: 100%;
	margin-bottom: 8px;
	word-wrap: break-word;
	text-overflow: ellipsis;
`;
