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
import styled, { css } from 'styled-components';
import Checkers from '@assets/images/checkers.svg';
import { SVGComponentToString } from '@/v5/helpers/react.helper';

export const GroupsTreeList = styled.ul`
    list-style-type: none;
    padding-inline-start: 0px;

`;

export const GroupsTreeListItem = styled.li<{$highlighted?: boolean }>`
    minimum-height: 41px;
    background-color: ${({ $highlighted }) => ($highlighted ? '#F7F7F7' : '#FFFFFF')};
    padding: 0 0 px;
    cursor: default;
`;

export const GroupsListItemTitle = styled.div`
    cursor: default;
    weight: 500;
    size: 12px;
    color
`;

const IconSize = css`
    width: 30px;
    height: 28px;
`;

const PseudoElement = css`
    ${IconSize}
    content: '';
    position: absolute;
`;

export const GroupIcon = styled.div<{$color?: string, $variant?: 'light' | 'dark' }>`
    ${IconSize}
    padding: 0 0 px;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    ${({ $variant }) => ($variant === 'light' ? `
        border: 1px solid #E0E5F0;
        color: #6B778C;
    ` : '')};

    & svg {
        z-index: 2;
    }

    &::after {
        background-color: ${({ $color }) => $color};
        ${PseudoElement}
    }

    &::before {
        background-image:url('data:image/svg+xml;utf8,${SVGComponentToString(Checkers)}');
        ${PseudoElement}
    }
`;
