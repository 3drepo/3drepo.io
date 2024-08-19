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
import { EMPTY_VECTOR } from '../../calibration.constants';

export const Calibration2DHandler = () => {
	const { isCalibrating, step, setIsCalibrating2D, setVector2D } = useContext(CalibrationContext);

	const canCalibrate2D = isCalibrating && step === 1;

	useEffect(() => {
		UnityUtil.setCalibrationToolMode('Vector');

		return () => {
			setIsCalibrating2D(false);
			setVector2D((vector) => vector?.[1] ? vector : EMPTY_VECTOR);
		};
	}, []);

	useEffect(() => {
		setIsCalibrating2D(canCalibrate2D);
	}, [canCalibrate2D]);

	return null;
};
