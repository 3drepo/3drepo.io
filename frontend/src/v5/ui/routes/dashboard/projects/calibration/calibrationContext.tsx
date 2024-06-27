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
import { generatePath, useParams } from 'react-router-dom';
import { Transformers, useSearchParam } from '../../../useSearchParam';
import { Vector3D } from '@/v5/store/drawings/drawings.types';
import { DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Arrow2D } from './calibration.types';

const EMPTY_VECTOR = { start: null, end: null };
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
	setVector3D: React.Dispatch<React.SetStateAction<Vector3D>>;
	resetVector3D: () => void;
	arrow2D: Arrow2D,
	setArrow2D: (points: Arrow2D) => void,
	drawingId: string;
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
	resetVector3D: () => {},
	arrow2D: EMPTY_VECTOR,
	setArrow2D: () => {},
	drawingId: '',
};
export const CalibrationContext = createContext(defaultValue);
CalibrationContext.displayName = 'CalibrationContext';

export const CalibrationContextComponent = ({ children }) => {
	const { teamspace, project, revision, containerOrFederation } = useParams();
	const [step, setStep] = useState(0);
	const [isStepValid, setIsStepValid] = useState(false);
	const [origin, setOrigin] = useState(generatePath(DRAWINGS_ROUTE, { teamspace, project }));
	const [isCalibrating] = useSearchParam('isCalibrating', Transformers.BOOLEAN);
	const [isCalibrating3D, setIsCalibrating3D] = useState(false);
	const [vector3D, setVector3D] = useState<Vector3D>(EMPTY_VECTOR);
	const [arrow2D, setArrow2D] = useState(EMPTY_VECTOR);
	const [drawingId] = useSearchParam('drawingId');
	const drawing = DrawingsHooksSelectors.selectDrawingById(drawingId);

	const resetVector3D = () => setVector3D(drawing?.vector3D || EMPTY_VECTOR);

	useEffect(() => {
		setStep(0);
		setIsStepValid(false);
	}, [containerOrFederation, revision, isCalibrating]);

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
			vector3D,
			setVector3D,
			resetVector3D,
			arrow2D,
			setArrow2D,
			drawingId,
		}}>
			{children}
		</CalibrationContext.Provider>
	);
};