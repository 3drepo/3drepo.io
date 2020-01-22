/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import * as React from 'react';
import { LEVELS_OF_RISK } from '../../../../../../constants/risks';
import { getRiskStatus } from '../../../../../../helpers/risks';
import { Container, Header, Status } from './levelOfRisk.styles';

interface IProps {
	// StatusIconComponent?: React.FunctionComponent<any>;
	// statusColor: string;
	mitigation_status: string;
	overall_level_of_risk: number;
}

export const LevelOfRisk: React.FunctionComponent<IProps> = ({
	mitigation_status: mitigationStatus, overall_level_of_risk: overallLevelOfRisk, ...props
}) => {
	const { name } = LEVELS_OF_RISK.find(({ value: riskValue }) => (riskValue === overallLevelOfRisk) );
	const { Icon, color } = getRiskStatus(overallLevelOfRisk, mitigationStatus);

	return (
		<>
			<Header>Level of Risk</Header>
			<Container color={color}>
				<Icon color="inherit" style={{ fontSize: 50 }} fontSize="inherit" />
				<Status>
					{name}
				</Status>
			</Container>
		</>
	);
};
