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
import { CalibrationContext } from '../calibrationContext';

const CalibrationStepContent = () => {
	const { setIsStepValid } = useContext(CalibrationContext);
	
	return (<button type='button' onClick={() => setIsStepValid(true)}>validate step</button>);
};

export const CalibrationStep = () => {
	const { step, setIsStepValid } = useContext(CalibrationContext);

	useEffect(() => {
		setIsStepValid(false);
	}, [step]);

	if (step === 0) return (<CalibrationStepContent />);

	if (step === 1) return (<CalibrationStepContent />);
	if (step === 2) return (<CalibrationStepContent/>);
	if (step === 3) return (<CalibrationStepContent />);
	return (<CalibrationStepContent/>);
};