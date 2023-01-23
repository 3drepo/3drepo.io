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

import { css } from 'styled-components';
import { DescriptionImage } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { UpdateButtonsContainer } from '@/v4/routes/viewerGui/components/updateButtons/updateButtons.styles';
import { Container as ButtonContainer } from '@/v4/routes/viewerGui/components/pinButton/pinButton.styles';

export default css`
	#risks-card-details {
		${DescriptionImage} img {
			border-radius: 5px;
		}
		${UpdateButtonsContainer} {
			justify-content: left;
			padding-top: 0;
	
			${ButtonContainer} {
				min-height: 26px;
			}
		}
	}
`;
