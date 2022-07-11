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

export const TypographyContainer = styled.div`
    font-family: ${({ theme }) => theme.typography.fontFamily};
    padding: 50px;

    * {
        border: 1px solid #cacaca;
        margin: 10px;
    }
`;

export const Body1 = styled.div`
    ${({ theme }) => theme.typography.body1};
`;

export const Body2 = styled.div`
    ${({ theme }) => theme.typography.body2};
`;

export const Link = styled.div`
    ${({ theme }) => theme.typography.link};
`;

export const Caption = styled.div`
    ${({ theme }) => theme.typography.caption};
`;

export const KickerTitle = styled.div`
    ${({ theme }) => theme.typography.kickerTitle};
`;

export const Kicker = styled.div`
    ${({ theme }) => theme.typography.kicker};
`;
