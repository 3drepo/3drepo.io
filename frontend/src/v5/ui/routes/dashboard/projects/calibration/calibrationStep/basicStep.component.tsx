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
import { CalibrationHooksSelectors } from '@/v5/services/selectorsHooks';
import { CalibrationActionsDispatchers } from '@/v5/services/actionsDispatchers';

export const BasicStep = ({ text }) => {
	const step = CalibrationHooksSelectors.selectStep();

	useEffect(() => {
		CalibrationActionsDispatchers.setIsStepValid(false);
	}, [step]);

	return (
		<div style={{
			borderRadius: 10,
			width: 'fit-content',
			padding: '50px 100px',
			backgroundImage: 'gray',
			border: 'solid 2px black',
			margin: 'auto',
			display: 'grid',
			placeContent: 'center',
			// REMINDER - the following property will be needed to be able to click inside the component
			pointerEvents: 'all',
			position: 'absolute',
			zIndex: 3,
			top: '200px',
			left: '100px',
		}}>
			<h2>This is the {text} step</h2>
			<button type='button' onClick={() => CalibrationActionsDispatchers.setIsStepValid(true)}>VALIDATE</button>
		</div>
	);
};
