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

import { useContext, useEffect } from 'react';
import { UnityUtil } from '@/globals/unity-util';
import { CalibrationContext } from '../../calibrationContext';

export const Calibration2DHandler = () => {
	const { setIsCalibrating2D } = useContext(CalibrationContext);

	useEffect(() => {
		UnityUtil.setCalibrationToolMode('Vector');
		return () => setIsCalibrating2D(false);
	}, []);

	return null;
};
