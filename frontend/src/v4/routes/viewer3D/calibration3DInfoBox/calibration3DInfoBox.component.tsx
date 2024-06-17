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

import { formatMessage } from '@/v5/services/intl';
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext'
import { CalibrationInfoBox } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationInfoBox/calibrationInfoBox.component';
import { useContext } from 'react'

export const Calibration3DInfoBox = () => {
	const { step } = useContext(CalibrationContext);

	if (step === 0) {
		return (
			<CalibrationInfoBox
				title={formatMessage({ defaultMessage: '3D Calibration Points', id: 'infoBox.title.firstStep' })}
				description={formatMessage({ defaultMessage: 'Select base and target point in the 3D Model to calibrate.', id: 'infoBox.description.secondStep' })}
			/>
		);
	};

	if (step === 2) {
		return (
			<CalibrationInfoBox
				title={formatMessage({ defaultMessage: '2D Calibration', id: 'infoBox.title.thirdStep' })}
				description={formatMessage({
					defaultMessage: 'Select the floor from the model tree or select an object from the model (the system will automatically set the drawing to central depth of selected object)',
					id: 'infoBox.description.thirdStep',
				})}
				hideDescriptionIcon
			/>
		);
	};
	return null;
}