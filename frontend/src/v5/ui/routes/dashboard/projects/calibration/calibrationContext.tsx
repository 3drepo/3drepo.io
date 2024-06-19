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
import { UnityUtil } from '@/globals/unity-util';
import { TreeActionsDispatchers } from '@/v5/services/actionsDispatchers';

type Coords3D = [number, number, number];
type Arrow3D = {
	start: Coords3D,
	end: Coords3D,
};
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
	arrow3D: Arrow3D,
	setArrow3D: (arrow: Partial<Arrow3D>) => void;
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
	arrow3D: { start: null, end: null },
	setArrow3D: () => {},
};
export const CalibrationContext = createContext(defaultValue);
CalibrationContext.displayName = 'CalibrationContext';

export const CalibrationContextComponent = ({ children }) => {
	const { teamspace, project, revision, containerOrFederation } = useParams();
	const [step, setStep] = useState(2);
	const [isStepValid, setIsStepValid] = useState(false);
	const [origin, setOrigin] = useState(generatePath(DRAWINGS_ROUTE, { teamspace, project }));
	const [isCalibrating] = useSearchParam('isCalibrating', Transformers.BOOLEAN);

	const [isCalibrating3D, setIsCalibrating3D] = useState(false);
	const [arrow3D, setArrow3D] = useState<{ start, end }>({ start: null, end: null });

	const handleSetArrow3D = ({ start = arrow3D.start, end = arrow3D.end }: Arrow3D) => {
		setArrow3D({ start, end });
		UnityUtil.setCalibrationToolVector(start, end);
	};

	const handleIsCalibrating3D = (newIsCalibrating3D) => {
		if (newIsCalibrating3D) {
			TreeActionsDispatchers.stopListenOnSelections();
			UnityUtil.setCalibrationToolMode('None');
		} else {
			TreeActionsDispatchers.startListenOnSelections();
			UnityUtil.enableSnapping();
			UnityUtil.setCalibrationToolMode('Vector');
		}
		setIsCalibrating3D(newIsCalibrating3D);
	};

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
			setIsCalibrating3D: handleIsCalibrating3D,
			arrow3D,
			setArrow3D: handleSetArrow3D,
		}}>
			{children}
		</CalibrationContext.Provider>
	);
};