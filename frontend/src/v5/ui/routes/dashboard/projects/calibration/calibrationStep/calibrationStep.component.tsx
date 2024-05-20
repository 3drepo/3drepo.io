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

import { useContext } from 'react';
import { CalibrationContext } from '../calibrationContext';
import { FakeSplitScreen } from './calibrationStep.styles';
import { Calibration3DStep } from './calibration3DStep/calibration3DStep.component';
import { Calibration2DStep } from './calibration2DStep/calibration2DStep.component';
import { VerticalSpatialBoundariesStep } from './verticalSpatialBoundariesStep/verticalSpatialBoundariesStep.component';
import { CalibrationConfirmationStep } from './calibrationConfirmationStep/calibrationConfirmationStep.component';
import { LeftPanelsButtons } from '@/v4/routes/viewerGui/viewerGui.styles';
import { ViewerGuiActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ViewerGuiHooksSelectors } from '@/v5/services/selectorsHooks';
import { PanelButton } from '@/v4/routes/viewerGui/components/panelButton/panelButton.component';
import { getCalibrationViewerLeftPanels } from '@/v4/constants/viewerGui';
import { Toolbar } from '@/v5/ui/routes/viewer/toolbar/toolbar.component';

export const CalibrationStep = () => {
	const { step } = useContext(CalibrationContext);
	const leftPanels = ViewerGuiHooksSelectors.selectLeftPanels();
	const show2DViewer = step < 2;

	return (
		<FakeSplitScreen>
			{/* Fake viewer waiting for 3d/2d screen split */}
			<div style={{
				position: 'relative',
				background: 'transparent',
			}}>
				<Toolbar />
				<LeftPanelsButtons>
					{getCalibrationViewerLeftPanels().map(({ name, type }) => (
						<PanelButton
							key={type}
							onClick={ViewerGuiActionsDispatchers.setPanelVisibility}
							label={name}
							type={type}
							id={type + '-panel-button'}
							active={leftPanels.includes(type)}
						/>
					))}
				</LeftPanelsButtons>
				{step === 0 && <Calibration3DStep />}
				{step === 1 && <Calibration2DStep />}
				{step === 2 && <VerticalSpatialBoundariesStep />}
				{step === 3 && <CalibrationConfirmationStep />}
			</div>
			{show2DViewer && (
				<div style={{
					height: '100%',
					width: '100%',
					backgroundImage: 'url("https://wpmedia.roomsketcher.com/content/uploads/2022/01/27111154/Profile_Black-2D_Floor_Plan.jpg")',
					backgroundSize: 'contain',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: 'center',
					backgroundColor: 'white',
				}}/>
			)}
		</FakeSplitScreen>
	);
};
