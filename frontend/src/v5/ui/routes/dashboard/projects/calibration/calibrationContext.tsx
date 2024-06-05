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

export interface CalibrationContextType {
	step: number;
	setStep: (step: number) => void;
	isStepValid: boolean;
	setIsStepValid: (isValid: boolean) => void;
	open: boolean;
	origin: string;
	setOrigin: (origin: string) => void;
}

const defaultValue: CalibrationContextType = {
	step: 0,
	setStep: () => {},
	isStepValid: false,
	setIsStepValid: () => {},
	open: false,
	origin: '',
	setOrigin: () => {},
};
export const CalibrationContext = createContext(defaultValue);
CalibrationContext.displayName = 'CalibrationContext';

export const CalibrationContextComponent = ({ children }) => {
	const { teamspace, project, revision, containerOrFederation } = useParams();
	const [step, setStep] = useState(0);
	const [isStepValid, setIsStepValid] = useState(false);
	const [origin, setOrigin] = useState(generatePath(DRAWINGS_ROUTE, { teamspace, project }));
	const [isCalibrating] = useSearchParam('isCalibrating', Transformers.BOOLEAN);

	useEffect(() => {
		setStep(0);
		setIsStepValid(false);
	}, [containerOrFederation, revision]);

	return (
		<CalibrationContext.Provider value={{ step, setStep, isStepValid, setIsStepValid, open: isCalibrating, origin, setOrigin }}>
			{children}
		</CalibrationContext.Provider>
	);
};