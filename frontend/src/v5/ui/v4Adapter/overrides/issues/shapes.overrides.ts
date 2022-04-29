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
import { Content } from '@/v4/routes/viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { MeasuringTypeContainer } from '@/v4/routes/viewerGui/components/risks/components/shapesFormTab/shapesFormTab.styles';
import { Wrapper as Measurement } from '@/v4/routes/viewerGui/components/measurements/components/measuringType/measuringType.styles';

export default css`
	${Content} {
		align-items: center;
		
		${MeasuringTypeContainer} {
			color: ${({ theme }) => theme.palette.base.main};
			font-size: 10px;
		}

		${Measurement} {
			margin: 0 8px;
			height: 24px;
		}
	}
`;
