/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { DialogContainer } from '@/v4/routes/components/dialogContainer';
import { SnackbarContainer } from '@/v4/routes/components/snackbarContainer';
import AdapterDayjs from '@mui/lab/AdapterDayjs';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { V4DialogsOverridesContainer } from './dialogs/v4DialogsOverrides.styles';
import { V4OverridesContainer } from './v4Overrides.styles';

export const V4Adapter = ({ children }) => (
	<V4OverridesContainer id="v4Overrides">
		<V4DialogsOverridesContainer id="v4DialogsOverrides">
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				{children}
				<DialogContainer />
				<SnackbarContainer />
			</LocalizationProvider>
		</V4DialogsOverridesContainer>
	</V4OverridesContainer>
);
