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

import { SvgIconProps } from '@material-ui/core/SvgIcon';

import { LEVELS_OF_RISK } from '../../../../../../constants/risks';
import { getRiskStatus } from '../../../../../../helpers/risks';
import { Container, Header, Status } from './levelOfRisk.styles';

interface IProps {
	header: string;
	level: number;
	status?: string;
	Icon?: React.ComponentType<SvgIconProps>;
}

export const LevelOfRisk: React.FunctionComponent<IProps> = ({ header, status, level, ...props
}) => {
	const currentRisk = LEVELS_OF_RISK.find(({ value }) => (value === level) );
	const name = currentRisk ? currentRisk.name : '';
	const { color, Icon } = getRiskStatus(level, status);
	const StatusIcon = props.Icon || Icon;

	return (
		<>
			<Header>{header}</Header>
			<Container color={color}>
				<StatusIcon color="inherit" style={{ fontSize: 50 }} fontSize="inherit" />
				<Status>
					{name}
				</Status>
			</Container>
		</>
	);
};
