/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { MainToolbar, ToolbarContainer } from './toolbar.styles';
import { NavigationButtons } from './buttons/buttonOptionsContainer/navigationButtons.component';
import { ProjectionButtons } from './buttons/buttonOptionsContainer/projectionButtons.component';
import { ClipButtons } from './buttons/buttonOptionsContainer/clipButtons.component';
import { SectionToolbar } from './selectionToolbar/selectionToolbar.component';
import { HomeButton, FocusButton, CoordinatesButton, BimButton } from './buttons/toolbarButtons.component';

export const Toolbar = () => (
	<ToolbarContainer>
		<MainToolbar>
			<HomeButton />
			<ProjectionButtons />
			<NavigationButtons />
			{/* <FocusButton /> // Commented out in case we need to easily reinstate it */}
			<ClipButtons />
			<CoordinatesButton />
			<BimButton />
		</MainToolbar>
		<SectionToolbar />
	</ToolbarContainer>
);
