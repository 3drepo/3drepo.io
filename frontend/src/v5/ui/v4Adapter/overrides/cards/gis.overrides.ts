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
import { StyledTextField } from '@/v4/routes/viewerGui/components/gis/components/settingsForm/settingsForm.styles';
import { StyledSelect } from '@/v4/routes/viewerGui/components/gis/gis.styles';

export default css`
	#gis-card {
		${StyledTextField} {
			margin: -2px 0 16px;
		}
		${StyledSelect} {
			[role="button"] {
				margin: 0;
				padding: 0 10px;
			}
			svg {
				margin: 0;
			}
		}
	}
`;
