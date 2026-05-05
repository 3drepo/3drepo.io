/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { COLOR } from '@/v4/styles';
import { TextField } from '@mui/material';
import styled from 'styled-components';

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    overflow: overlay;
    flex: auto;
`;

export const ViewerBottomActions = styled.div`
    height: 100%;
    margin: 0;
    display: flex;
    align-items: center;
    width: 100%;
`;

export const NewItemWrapper = styled.div`
    display: flex;
    flex: 1;
`;

export const SearchField = styled(TextField)`
    && {
        flex: none;
    }
`;

export const Link = styled.a`
    color: ${COLOR.PRIMARY_MAIN};
`;
