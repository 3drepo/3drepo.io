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

import { useEffect } from 'react';
import { Transformers, useSearchParam } from '../../../useSearchParam';
import { CalibrationActionsDispatchers, CompareActionsDispatchers, TicketsCardActionsDispatchers, ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { useParams } from 'react-router-dom';

export const CalibrationHandler = () => {
	const { revision, containerOrFederation } = useParams();
	const [isCalibrating] = useSearchParam('isCalibrating', Transformers.BOOLEAN);
	const [drawingId] = useSearchParam('drawingId');

	useEffect(() => {
		CalibrationActionsDispatchers.setStep(0);
		CalibrationActionsDispatchers.setIsStepValid(false);
	}, [containerOrFederation, revision, isCalibrating]);

	useEffect(() => {
		CalibrationActionsDispatchers.setIsCalibrating(isCalibrating);
		if (isCalibrating) {
			ViewerGuiActionsDispatchers.resetPanels();
			TicketsCardActionsDispatchers.resetState();
			CompareActionsDispatchers.resetComponentState();
		}
	}, [isCalibrating]);

	useEffect(() => {
		CalibrationActionsDispatchers.setDrawingId(drawingId);
	}, [drawingId]);
	
	return null;
};
