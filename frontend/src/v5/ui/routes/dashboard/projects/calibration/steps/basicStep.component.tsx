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

export const BasicStep = ({ text }) => {
	const { setIsStepValid, step } = useContext(CalibrationContext);

	useEffect(() => {
		setIsStepValid(false);
	}, [step]);

	return (
		<div style={{ position: 'absolute', left: '5%' }}>
			<div style={{
				borderRadius: 10,
				width: 'fit-content',
				padding: '50px 100px',
				background: 'beige',
				margin: 'auto',
				display: 'grid',
				placeContent: 'center',
			}}>
				<h2>This is the {text} step</h2>
				<button type='button' onClick={() => setIsStepValid(true)}>VALIDATE</button>
			</div>
		</div>
	);
};
