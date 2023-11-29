/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import { Field } from 'formik';
import SaveIcon from '@mui/icons-material/Save';

import { selectSettings } from '@/v4/modules/model';
import { isViewer } from '@/v4/helpers/permissions';
import { select } from 'redux-saga/effects';
import { ViewerPanelButton, ViewerPanelFooter } from '../../../viewerPanel/viewerPanel.styles';
import { Container, Header, Headline, StyledForm, StyledTextField } from './settingsForm.styles';


const defaultFieldProps = {
	required: true,
	margin: 'normal'
};

export const SettingsForm = (props) => {
	const { unit, readOnly } = props;
	return (
		<StyledForm>
			<Container>
				<Header>
					To visualize map tiles match GIS point with project base point
				</Header>
				<Headline color="primary" variant="subtitle1">
					GIS Point - World Coordinates
				</Headline>
				<Field name="latitude" render={ ({ field, form }) => (
					<StyledTextField
						{...field}
						{...defaultFieldProps}
						error={Boolean(form.errors.latitude)}
						helperText={form.errors.latitude}
						label="Latitude"
						disabled={readOnly}
					/>
				)} />
				<Field name="longitude" render={ ({ field, form }) => (
					<StyledTextField
						{...field}
						{...defaultFieldProps}
						error={Boolean(form.errors.longitude)}
						helperText={form.errors.longitude}
						label="Longitude"
						disabled={readOnly}
					/>
				)} />
				<Field name="angleFromNorth" render={ ({ field, form }) => (
					<StyledTextField
						{...field}
						{...defaultFieldProps}
						error={Boolean(form.errors.angleFromNorth)}
						helperText={form.errors.angleFromNorth}
						label="Angle from North (Clockwise Degrees)"
						disabled={readOnly}
					/>
				)} />
				<Headline color="primary" variant="subtitle1">
					Project Base Point - Model Coordinates
				</Headline>

				<Field name="axisX" render={ ({ field, form }) => (
					<StyledTextField
						{...field}
						{...defaultFieldProps}
						error={Boolean(form.errors.axisX)}
						helperText={form.errors.axisX}
						label={unit ? `x (${unit})` : 'x'}
						disabled={readOnly}
					/>
				)} />
				<Field name="axisY" render={ ({ field, form }) => (
					<StyledTextField
						{...field}
						{...defaultFieldProps}
						error={Boolean(form.errors.axisY)}
						helperText={form.errors.axisY}
						label={unit ? `y (${unit})` : 'y'}
						disabled={readOnly}
					/>
				)} />
				<Field name="axisZ" render={ ({ field, form }) => (
					<StyledTextField
						{...field}
						{...defaultFieldProps}
						error={Boolean(form.errors.axisZ)}
						helperText={form.errors.axisZ}
						label={unit ? `z (${unit})` : 'z'}
						disabled={readOnly}
					/>
				)} />
			</Container>
			<ViewerPanelFooter container alignItems="center" justifyContent="flex-end">
				<Field render={({ form }) => (
					<ViewerPanelButton
						type="submit"
						aria-label="Save"
						color="secondary"
						disabled={!form.isValid || form.isValidating || readOnly || !form.dirty}
						variant="fab"
					>
						<SaveIcon />
					</ViewerPanelButton>
				)} />
			</ViewerPanelFooter>
		</StyledForm>
	);
};
