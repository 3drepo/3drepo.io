/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import { Button } from '@mui/material';
import { Field } from 'formik';
import {
	NeutralActionButton,
	VisualSettingsButtonsContainer
} from '../../topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';

export const DialogButtons = ({onClickCancel, validateUploadLimit}) => {
	return (
		<VisualSettingsButtonsContainer>
			<NeutralActionButton
				color="primary"
				variant="contained"
				disabled={false}
				type="button"
				onClick={onClickCancel}
			>
				Cancel
			</NeutralActionButton>

			<Field render={ ({ form }) => (
				<Button
					color="primary"
					variant="contained"
					type="submit"
					disabled={!form.isValid || form.isValidating || !validateUploadLimit(form.values.files) || !form.dirty}
				>
					Save
				</Button>
			)} />
		</VisualSettingsButtonsContainer>
		);
};
