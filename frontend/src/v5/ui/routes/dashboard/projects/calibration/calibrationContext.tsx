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
import { CalibrationState, Vector3D } from '@/v5/store/drawings/drawings.types';
import { DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';

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
	setVector3D: (vector: Partial<Vector3D>) => void;
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
	const [vector3D, setVector3D] = useState<{ start, end }>(EMPTY_VECTOR);
	const [drawingId] = useSearchParam('drawingId');
	const drawing = DrawingsHooksSelectors.selectDrawingById(drawingId);

	const handleSetVector3D = ({ start = vector3D.start, end = vector3D.end }: Vector3D) => {
		setVector3D({ start, end });
		UnityUtil.setCalibrationToolVector(start, end);
	};

	const handleIsCalibrating3D = (newIsCalibrating3D) => {
		if (newIsCalibrating3D) {
			TreeActionsDispatchers.stopListenOnSelections();
			UnityUtil.enableSnapping();
			UnityUtil.setCalibrationToolMode('Vector');
		} else {
			TreeActionsDispatchers.startListenOnSelections();
			UnityUtil.setCalibrationToolMode('None');

			if (vector3D.start && !vector3D.end) {
				setVector3D(EMPTY_VECTOR);
			}
		}
		setIsCalibrating3D(newIsCalibrating3D);
	};

	useEffect(() => {
		setStep(0);
		setIsStepValid(false);
	}, [containerOrFederation, revision, isCalibrating]);

	useEffect(() => {
		handleSetVector3D(drawing?.vector3D || EMPTY_VECTOR);
	}, [drawing]);

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
			vector3D,
			setVector3D: handleSetVector3D,
		}}>
			{children}
		</CalibrationContext.Provider>
	);
};