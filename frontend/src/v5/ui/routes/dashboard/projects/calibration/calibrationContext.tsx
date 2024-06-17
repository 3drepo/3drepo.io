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
import { Arrow2D } from './calibration.types';

export interface CalibrationContextType {
	step: number;
	setStep: (step: number) => void;
	isStepValid: boolean;
	setIsStepValid: (isValid: boolean) => void;
	isCalibrating: boolean;
	origin: string;
	setOrigin: (origin: string) => void;
	arrow2D: Arrow2D,
	setArrow2D: (points: Arrow2D) => void,
}

const defaultValue: CalibrationContextType = {
	step: 0,
	setStep: () => {},
	isStepValid: false,
	setIsStepValid: () => {},
	isCalibrating: false,
	origin: '',
	setOrigin: () => {},
	arrow2D: { start: null, end: null },
	setArrow2D: () => {},
};
export const CalibrationContext = createContext(defaultValue);
CalibrationContext.displayName = 'CalibrationContext';

export const CalibrationContextComponent = ({ children }) => {
	const { teamspace, project, revision, containerOrFederation } = useParams();
	const [step, setStep] = useState(0);
	const [isStepValid, setIsStepValid] = useState(false);
	const [origin, setOrigin] = useState(generatePath(DRAWINGS_ROUTE, { teamspace, project }));
	const [isCalibrating] = useSearchParam('isCalibrating', Transformers.BOOLEAN);
	const [arrow2D, setArrow2D] = useState({ start: null, end: null });

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
			arrow2D,
			setArrow2D,
		}}>
			{children}
		</CalibrationContext.Provider>
	);
};