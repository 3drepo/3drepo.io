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

import { BimButton, HomeButton, CalibrationButton, VerticalCalibrationButton } from '@/v5/ui/routes/viewer/toolbar/buttons/toolbarButtons.component';
import { ClipButtons } from '@/v5/ui/routes/viewer/toolbar/buttons/buttonOptionsContainer/clipButtons.component';
import { NavigationButtons } from '@/v5/ui/routes/viewer/toolbar/buttons/buttonOptionsContainer/navigationButtons.component';
import { ProjectionButtons } from '@/v5/ui/routes/viewer/toolbar/buttons/buttonOptionsContainer/projectionButtons.component';
import { MainToolbar, ToolbarContainer } from '@/v5/ui/routes/viewer/toolbar/toolbar.styles';
import { SectionToolbar } from '@/v5/ui/routes/viewer/toolbar/selectionToolbar/selectionToolbar.component';
import { CalibrationContext } from '../calibrationContext';
import { useContext } from 'react';

export const CalibrationToolbar = () => {
	const { step } = useContext(CalibrationContext);
	
	return (
		<ToolbarContainer>
			<MainToolbar>
				<HomeButton />
				<ProjectionButtons />
				<NavigationButtons />
				{step !== 2 && <ClipButtons />}
				<BimButton />
				<CalibrationButton />
				<VerticalCalibrationButton />
			</MainToolbar>
			<SectionToolbar />
		</ToolbarContainer>
	);
};
