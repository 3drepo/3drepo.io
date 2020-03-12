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

import React from 'react';

import { UnityUtil } from '../../../../../../globals/unity-util';
import { MEASURING_TYPES } from './measuringType.constants';
import { StyledSvgIcon, Icon } from './measuringType.styles';

interface IProps {
	teamspace: string;
	model: string;
	isMeasureActive: boolean;
	isMeasureDisabled: boolean;
	disableMeasure: (isDisabled) => void;
	deactivateMeasure: () => void;
	activateMeasure: () => void;
}

export const MeasuringType = ({ activateMeasure }: IProps) => {

	const handleMeasuringTypeClick = () => {
		activateMeasure();
		UnityUtil.enableMeasureToolToolbar();
	};

	console.info('DEFAULT_VIEWPOINTS:', MEASURING_TYPES);

	return (
			<>
				{MEASURING_TYPES.map(({ icon, name, ...props }) => (
						<Icon src={icon} alt={name} onClick={handleMeasuringTypeClick} key={name} />
				))}
			</>
	);
};
