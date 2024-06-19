/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import CalibrationIcon from '@assets/icons/filled/calibration-filled.svg';
import { useContext } from 'react';
import { ToolbarButton } from '@/v5/ui/routes/viewer/toolbar/buttons/toolbarButton.component';
import { formatMessage } from '@/v5/services/intl';
import { CalibrationContext } from '../../../calibrationContext';

export const CalibrationButton = () => {
	const { step, isCalibrating3D, setIsCalibrating3D } = useContext(CalibrationContext);

	return (
		<ToolbarButton
			Icon={CalibrationIcon}
			hidden={step !== 0}
			selected={isCalibrating3D}
			onClick={() => setIsCalibrating3D(!isCalibrating3D)}
			title={formatMessage({ id: 'viewer.toolbar.icon.calibrate', defaultMessage: 'Calibrate' })}
		/>
	);
};
