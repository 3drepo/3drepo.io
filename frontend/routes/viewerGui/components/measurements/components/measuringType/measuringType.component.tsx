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

import { Tooltip } from '@material-ui/core';

import { VIEWER_EVENTS } from '../../../../../../constants/viewer';
import { VIEWER_PANELS } from '../../../../../../constants/viewerGui';
import { uuid } from '../../../../../../helpers/uuid';
import { MEASURE_TYPE, MEASURING_MODE } from '../../../../../../modules/measurements/measurements.constants';
import { MEASURING_TYPES } from './measuringType.constants';
import { Icon, Wrapper } from './measuringType.styles';

interface IProps {
	viewer: any;
	teamspace: string;
	model: string;
	isMeasureActive: boolean;
	setMeasureMode: (mode) => void;
	measureMode: string;
	disableMeasure: (isDisabled) => void;
	deactivateMeasure: () => void;
	activateMeasure: () => void;
	addMeasurement: (measure: any) => void;
	isMetadataActive: boolean;
	setMetadataActive: (isActive) => void;
	setPanelVisibility: (panelName, visibility) => void;
	isClipEdit: boolean;
	setClipEdit: (isActive) => void;
}

export const MeasuringType = ({
	activateMeasure, deactivateMeasure, setMeasureMode, measureMode, viewer, addMeasurement, isMetadataActive,
	setMetadataActive, setPanelVisibility, isClipEdit, setClipEdit
}: IProps) => {

	const handlePickPoint = ({ trans, position }) => {
		if (measureMode === MEASURING_MODE.POINT) {
			if (trans) {
				position = trans.inverse().multMatrixPnt(position);
			}
			addMeasurement({
				uuid: uuid(),
				position,
				type: MEASURE_TYPE.POINT,
				color: { r: 0, g: 1, b: 1, a: 1},
			});
		}
	};

	const togglePinListeners = (enabled: boolean) => {
		const resolver = enabled ? 'on' : 'off';
		viewer[resolver](VIEWER_EVENTS.PICK_POINT, handlePickPoint);
	};

	React.useEffect(() => {
		if (isMetadataActive || isClipEdit) {
			setMeasureMode('');
			deactivateMeasure();
		}
	}, [isMetadataActive, isClipEdit]);

	React.useEffect(() => {
		if (measureMode === '' || measureMode === MEASURING_MODE.POINT) {
			deactivateMeasure();

			if (measureMode === MEASURING_MODE.POINT) {
				togglePinListeners(true);
			}
		} else {
			activateMeasure();
			togglePinListeners(false);
		}
		return () => {
			deactivateMeasure();
			togglePinListeners(false);
		};
	}, [measureMode]);

	const handleMeasuringTypeClick = (mode) => () => {
		if (isMetadataActive) {
			setMetadataActive(false);
			setPanelVisibility(VIEWER_PANELS.BIM, false);
		}

		if (isClipEdit) {
			setClipEdit(false);
		}

		if (mode === measureMode) {
			setMeasureMode('');
			return deactivateMeasure();
		}

		setMeasureMode(mode);
	};

	return (
			<>
				{MEASURING_TYPES.map(({ icon, activeIcon, name, mode }) => (
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
