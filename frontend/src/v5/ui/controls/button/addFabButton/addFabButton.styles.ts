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

import { Fab } from '@mui/material';
import styled from 'styled-components';

export const AddButton = styled(Fab)`
    && {
        background-color: transparent;
        color: ${({ theme }) => theme.palette.primary.main};
        margin: 0;
        border: 0;
        width: 32px;
        height: 32px;

        &:hover {
            background-color: transparent;
            color: ${({ theme }) => theme.palette.primary.dark};
        }
        &:active {
            background-color: transparent;
            box-shadow: none;
            color: ${({ theme }) => theme.palette.primary.darkest};
        }
        &:disabled {
            background-color: transparent;

            color: #edf0f8; // TODO - fix after new palette is released
        }
    }
`;