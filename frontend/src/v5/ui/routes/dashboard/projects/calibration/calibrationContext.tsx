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

import { createContext, useEffect, useState } from 'react';
import { Transformers, useSearchParam } from '../../../useSearchParam';
import { PlaneType, Vector2D, Vector3D, VerticalPlanes } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { EMPTY_VECTOR } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.constants';
import { CalibrationHandler } from './calibrationHandler.component';
import { Viewer } from '@/v4/services/viewer/viewer';

export interface CalibrationContextType {
	step: number;
	setStep: (step: number) => void;
	isStepValid: boolean;
	setIsStepValid: (isValid: boolean) => void;
	isCalibrating: boolean;
	origin: string;
	setOrigin: (origin: string) => void;
	isCalibrating3D: boolean,
	setIsCalibrating3D: (isCalibrating3D: boolean) => void;
	vector3D: Vector3D,
	setVector3D: (vectorState: React.SetStateAction<Vector3D>) => void;
	vector2D: Vector2D,
	setVector2D: (points: Vector2D) => void,
	drawingId: string;
	verticalPlanes: VerticalPlanes,
	setVerticalPlanes: (planes: VerticalPlanes) => void,
	isCalibratingPlanes: boolean,
	setIsCalibratingPlanes: (isCalibratingPlanes: boolean) => void,
	selectedPlane: PlaneType,
	setSelectedPlane: (plane: PlaneType) => void,
}

const defaultValue: CalibrationContextType = {
	step: 0,
	setStep: () => {},
	isStepValid: false,
	setIsStepValid: () => {},
	isCalibrating: false,
	origin: '',
	setOrigin: () => {},
	isCalibrating3D: false,
	setIsCalibrating3D: () => {},
	vector3D: EMPTY_VECTOR,
	setVector3D: () => {},
	vector2D: EMPTY_VECTOR,
	setVector2D: () => {},
	drawingId: '',
	verticalPlanes: { [PlaneType.UPPER]: null, [PlaneType.LOWER]: null },
	setVerticalPlanes: () => {},
	isCalibratingPlanes: false,
	setIsCalibratingPlanes: () => {},
	selectedPlane: null,
	setSelectedPlane: () => {},
};
export const CalibrationContext = createContext(defaultValue);
CalibrationContext.displayName = 'CalibrationContext';

export const CalibrationContextComponent = ({ children }) => {
	const [step, setStep] = useState(0);
	const [isStepValid, setIsStepValid] = useState(false);
	const [origin, setOrigin] = useState('');
	const [isCalibrating] = useSearchParam('isCalibrating', Transformers.BOOLEAN);
	const [isCalibrating3D, setIsCalibrating3D] = useState(false);
	const [isCalibratingPlanes, setIsCalibratingPlanes] = useState(false);
	const [vector3D, setVector3D] = useState<Vector3D>(EMPTY_VECTOR);
	const [vector2D, setVector2D] = useState<Vector2D>(EMPTY_VECTOR);
	const [verticalPlanes, setVerticalPlanes] = useState<VerticalPlanes>({ [PlaneType.UPPER]: null, [PlaneType.LOWER]: null });
	const [selectedPlane, setSelectedPlane] = useState<PlaneType>(null);
	const [drawingId] = useSearchParam('drawingId');

	useEffect(() => {
		if (selectedPlane === PlaneType.LOWER) {
			Viewer.selectCalibrationToolLowerPlane();
		} else {
			Viewer.selectCalibrationToolUpperPlane();
		}
	}, [selectedPlane]);

	return (
		<CalibrationContext.Provider value={{
			step,
			setStep,
			isStepValid,
			setIsStepValid,
			isCalibrating,
			origin,
			setOrigin,
			isCalibrating3D,
			setIsCalibrating3D,
			vector2D,
			setVector2D,
			vector3D,
			setVector3D,
			drawingId,
			verticalPlanes,
			setVerticalPlanes,
			isCalibratingPlanes,
			setIsCalibratingPlanes,
			selectedPlane,
			setSelectedPlane,
		}}>
			{isCalibrating && <CalibrationHandler />}
			{children}
		</CalibrationContext.Provider>
	);
};