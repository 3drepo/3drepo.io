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
import { CALIBRATION_VIEWER_ROUTE, matchesPath } from '../../../routes.constants';
import { useParams } from 'react-router-dom';

export interface CalibrationContextType {
	step: number;
	setStep: (step: number) => void;
	isStepValid: boolean;
	setIsStepValid: (isValid: boolean) => void;
	open: boolean;
}

const defaultValue: CalibrationContextType = {
	step: 0,
	setStep: () => {},
	isStepValid: false,
	setIsStepValid: () => {},
	open: false,
};
export const CalibrationContext = createContext(defaultValue);
CalibrationContext.displayName = 'CalibrationContext';

export const CalibrationContextComponent = ({ children }) => {
	const { revision, containerOrFederation } = useParams();
	const [step, setStep] = useState(0);
	const [isStepValid, setIsStepValid] = useState(false);
	const open = matchesPath(CALIBRATION_VIEWER_ROUTE);

	useEffect(() => {
		setStep(0);
		setIsStepValid(false);
	}, [containerOrFederation, revision]);

	return (
		<CalibrationContext.Provider value={{ step, setStep, isStepValid, setIsStepValid, open }}>
			{children}
		</CalibrationContext.Provider>
	);
};