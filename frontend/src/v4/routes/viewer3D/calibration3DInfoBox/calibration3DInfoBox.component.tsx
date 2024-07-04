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
import { CalibrationInfoBox } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationInfoBox/calibrationInfoBox.component';
import CalibrationIcon from '@assets/icons/filled/calibration-filled.svg';
import { CalibrationHooksSelectors } from '@/v5/services/selectorsHooks';

export const Calibration3DInfoBox = () => {
	const step = CalibrationHooksSelectors.selectStep();

	if (step === 0) {
		return (
			<CalibrationInfoBox
				title={formatMessage({ defaultMessage: '3D Alignment', id: 'infoBox.3dAlignment.title' })}
				description={formatMessage({
					id: 'infoBox.3dAlignment.description',
					defaultMessage: `
						This wizard helps you to align 2D to 3D by selecting two points in 3D and the same points in 2D, click on the {icon}
						on your navigation bar and then please select your two points in the 3D Viewer.
					`,
				}, { icon: <CalibrationIcon /> })}
			/>
		);
	};

	if (step === 2) {
		return (
			<CalibrationInfoBox
				title={formatMessage({ defaultMessage: '2D Vertical Extents', id: 'infoBox.verticalExtents.title' })}
				description={formatMessage({
					id: 'infoBox.verticalExtents.description',
					defaultMessage: `
						This step filters features from 3D to make them visible in 2D (i.e. Custom Tickets).
						Place the bottom and top planes to define the vertical extents of your drawing.
					`,
				})}
			/>
		);
	};
	return null;
}