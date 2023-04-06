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

import { CoverImage } from '@controls/coverImage/coverImage.component';
import styled from 'styled-components';
import { LinkCard } from '../linkCard.component';
import { Details } from '../linkCard.styles';

export const TeamspaceImage = styled(CoverImage)`
	height: 132px;
`;

export const TeamspaceLinkCard = styled(LinkCard)`
	${Details} {
		padding: 5px 0 0;
	}
`;
