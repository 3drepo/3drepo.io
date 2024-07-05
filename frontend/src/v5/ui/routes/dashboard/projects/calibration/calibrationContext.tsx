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
import { DRAWINGS_ROUTE } from '../../../routes.constants';
import { generatePath, useParams, useHistory } from 'react-router-dom';
import { Transformers, useSearchParam } from '../../../useSearchParam';
import { Vector2D, Vector3D } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { EMPTY_VECTOR } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.constants';

export interface CalibrationContextType {
	step: number;
	setStep: (step: number) => void;
	isStepValid: boolean;
	setIsStepValid: (isValid: boolean) => void;
	isCalibrating: boolean;
	endCalibration: () => void,
	origin: string;
	setOrigin: (origin: string) => void;
	isCalibratingModel: boolean,
	setIsCalibratingModel: (isCalibratingModel: boolean) => void;
	modelCalibration: Vector3D,
	setModelCalibration: (vectorState: React.SetStateAction<Vector3D>) => void;
	drawingCalibration: Vector2D,
	setDrawingCalibration: (points: Vector2D) => void,
	drawingId: string;
}

const defaultValue: CalibrationContextType = {
	step: 0,
	setStep: () => {},
	isStepValid: false,
	setIsStepValid: () => {},
	isCalibrating: false,
	endCalibration: () => {},
	origin: '',
	setOrigin: () => {},
	isCalibratingModel: false,
	setIsCalibratingModel: () => {},
	modelCalibration: EMPTY_VECTOR,
	setModelCalibration: () => {},
	drawingCalibration: EMPTY_VECTOR,
	setDrawingCalibration: () => {},
	drawingId: '',
};
export const CalibrationContext = createContext(defaultValue);
CalibrationContext.displayName = 'CalibrationContext';

export const CalibrationContextComponent = ({ children }) => {
	const history = useHistory();
	const { teamspace, project, revision, containerOrFederation } = useParams();
	const [step, setStep] = useState(0);
	const [isStepValid, setIsStepValid] = useState(false);
	const [origin, setOrigin] = useState('');
	const [isCalibrating] = useSearchParam('isCalibrating', Transformers.BOOLEAN);
	const [isCalibratingModel, setIsCalibratingModel] = useState(false);
	const [modelCalibration, setModelCalibration] = useState<Vector3D>(EMPTY_VECTOR);
	const [drawingCalibration, setDrawingCalibration] = useState(EMPTY_VECTOR);
	const [drawingId] = useSearchParam('drawingId');

	useEffect(() => {
		setStep(0);
		setIsStepValid(false);
	}, [containerOrFederation, revision, isCalibrating]);

	useEffect(() => {
		if (!isCalibrating || !origin) {
			setOrigin(generatePath(DRAWINGS_ROUTE, { teamspace, project }));
		}
	}, [isCalibrating]);

	return (
		<CalibrationContext.Provider value={{
			step,
			setStep,
			isStepValid,
			setIsStepValid,
			isCalibrating,
			endCalibration: () => history.push(origin),
			origin,
			setOrigin,
			isCalibratingModel,
			setIsCalibratingModel,
			modelCalibration,
			setModelCalibration,
			drawingCalibration,
			setDrawingCalibration,
			drawingId,
		}}>
			{children}
		</CalibrationContext.Provider>
	);
};