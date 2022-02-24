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

import { useEffect } from 'react';

import { Tooltip } from '@material-ui/core';

import { BASIC_TYPES, MEASURING_TYPES } from './measuringType.constants';
import { Icon, Wrapper } from './measuringType.styles';

interface IProps {
	setMeasureMode: (mode) => void;
	measureMode: string;
	isMetadataActive: boolean;
	isClipEdit: boolean;
	basicTypes?: boolean;
}

const isBasicType = (({mode}) => BASIC_TYPES.includes(mode));

export const MeasuringType = ({
	setMeasureMode, measureMode, isMetadataActive, isClipEdit
, basicTypes}: IProps) => {
	useEffect(() => {
		if (isMetadataActive || isClipEdit) {
			setMeasureMode('');
		}
	}, [isMetadataActive, isClipEdit]);

	const handleMeasuringTypeClick = (mode) => () => {
		if (mode === measureMode) {
			setMeasureMode('');
		} else {
			setMeasureMode(mode);
		}
	};

	const AVAILABLE_TYPES = !basicTypes ? MEASURING_TYPES : MEASURING_TYPES.filter(isBasicType);

	return (
			<>
				{AVAILABLE_TYPES.map(({ icon, activeIcon, name, mode }) => (
					<Tooltip title={name} key={name}>
						<Wrapper>
							<Icon
								src={mode === measureMode ? activeIcon : icon}
								alt={name}
								onClick={handleMeasuringTypeClick(mode)}
							/>
						</Wrapper>
					</Tooltip>
				))}
			</>
	);
};
