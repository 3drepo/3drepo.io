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
import { GroupIcon } from '@/v5/ui/routes/viewer/groups/groupItem/groupIcon/groupIcon.styles';

export const PaletteName = styled.h1`
	${(({ theme }) => theme.typography.h1)}
`;

export const PaletteColorSampleContainer = styled.h5`
	${(({ theme }) => theme.typography.h5)}
	display: flex;
	align-items: center;
`;

export const PaletteSampleContainer = styled.div`
	margin: 20px;
`;

export const PaletteContainer = styled.div`
	margin: 50px;
`;

export const ColorPreview = styled(GroupIcon)`
	width: 30px;
	height: 30px;
	border-radius: 6px;
`;
