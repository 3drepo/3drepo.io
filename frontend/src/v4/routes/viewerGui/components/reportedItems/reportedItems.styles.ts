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
import { DashedContainer as DashedContainerBase } from '@controls/dashedContainer/dashedContainer.component';
import { COLOR } from '@/v4/styles';

export const DashedContainer = styled(DashedContainerBase).attrs({
	$strokeColor: '#c0c8d5', // TODO - fix when new palette is released
	$borderRadius: 5,
	$dashSize: 2,
	$gapSize: 2,
	$strokeWidth: 2,
	$zeroPadding: true,
})`
	margin: 12px 15px;
`;

export const ListContainer = styled.ul`
	height: auto;
	padding: 0;
	margin: 0;
	cursor: pointer;
`;

export const Summary = styled.div`
	color: ${COLOR.BLACK_40};
`;
