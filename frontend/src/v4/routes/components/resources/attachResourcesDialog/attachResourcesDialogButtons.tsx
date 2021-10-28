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
import { Button } from '@material-ui/core';
import { Field } from 'formik';
import * as React from 'react';
import {
	NeutralActionButton,
	VisualSettingsButtonsContainer
} from '../../topMenu/components/visualSettingsDialog/visualSettingsDialog.styles';

export const DialogButtons = ({onClickCancel, validateQuota, validateUploadLimit}) => {
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
					color="secondary"
					variant="contained"
					type="submit"
					disabled={!form.isValid || form.isValidating ||
						!validateQuota(form.values.files) || !validateUploadLimit(form.values.files) }
				>
					Save
				</Button>
			)} />
		</VisualSettingsButtonsContainer>
		);
};
