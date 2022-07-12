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
import SmallChevron from '@assets/icons/small_chevron.svg';
import { ChevronStyledIconButton } from '@controls/chevronButton/chevronButton.styles';
import { isV5 } from '@/v4/helpers/isV5';
import { GroupsTreeListItemComponent } from './groupItemContainer.component';

export const GroupSetName = isV5() ? styled.h5`
    ${({ theme }) => theme.typography.h5};
    color: ${({ theme }) => theme.palette.secondary.main};
    `
	: styled.div`
    color: #757575;
    font-family: Roboto;
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
`;

export const GroupsSetTreeListItemComponent = styled(GroupsTreeListItemComponent)<{$padding?: boolean}>` {
    padding-top:  ${({ $padding }) => ($padding ? '11' : '0')}px;
    background-color: #EBEBEB;

    ${ChevronStyledIconButton} {
        margin: 0;
    }
`;

export const CollapsibleIconV4 = styled(SmallChevron)<{$collapsed?: boolean}>` {
    color: #757575;

    ${({ $collapsed }) => (!$collapsed ? `
    transform: rotate(90deg);` : '')};
`;
