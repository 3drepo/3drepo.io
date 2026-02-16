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

import { formatMessage } from '@/v5/services/intl';
import { FormTextField, FormSelect, FormNumberField } from '@controls/inputs/formInputs.component';
import { MenuItem } from '@mui/material';
import { DrawingsHooksSelectors, ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { nameAlreadyExists, numberAlreadyExists } from '@/v5/validation/errors.helpers';
import { UnhandledErrorInterceptor } from '@controls/errorMessage/unhandledErrorInterceptor/unhandledErrorInterceptor.component';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { ShareTextField } from '@controls/shareTextField';
import { FormattedMessage } from 'react-intl';
import { DoubleInputLineContainer, SubTitle, Title } from './drawingForm.styles';
import { Gap } from '@controls/gap';
import { MODEL_UNITS } from '../../models.helpers';
import { CALIBRATION_INVALID_RANGE_ERROR } from '@/v5/validation/drawingSchemes/drawingSchemes';

interface Props { 
	formData: any,
	drawing?: Partial<IDrawing>,
}

export const DrawingForm = ({ formData, drawing }:Props) => {
	const types = DrawingsHooksSelectors.selectTypes();
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();

	const { formState: { errors }, control } = formData;
	const hideBottomExtentError = (errors.calibration?.verticalRange || []).some((e) => e.message === CALIBRATION_INVALID_RANGE_ERROR);

	return (
		<>
			<Title>
				<FormattedMessage
					id="drawings.form.informationTitle"
					defaultMessage="Drawing information"
				/>
			</Title>
			{(drawing as any)?._id && (
				<ShareTextField
					label={formatMessage({ id: 'drawings.form.id', defaultMessage: 'ID' })}
					value={(drawing as any)?._id}
				/>
			)}
			<FormTextField
				control={control}
				name="name"
				label={formatMessage({ id: 'drawings.form.name', defaultMessage: 'Name' })}
				formError={errors.name}
				disabled={!isProjectAdmin}
				required
			/>
			<FormTextField
				control={control}
				name="number"
				label={formatMessage({ id: 'drawings.form.number', defaultMessage: 'Number' })}
				formError={errors.number}
				disabled={!isProjectAdmin}
				required
			/>
			<FormSelect
				control={control}
				name="type"
				label={formatMessage({ id: 'drawings.form.type', defaultMessage: 'Category' })}
				disabled={!isProjectAdmin}
				required
			>
				{types.map((type) => (
					<MenuItem key={type} value={type}> {type}</MenuItem>
				))}
			</FormSelect>
			<FormTextField
				control={control}
				name="desc"
				label={formatMessage({ id: 'drawings.form.description', defaultMessage: 'Description' })}
				formError={errors.desc}
				disabled={!isProjectAdmin}
			/>
			<Gap $height="18px" />
			<Title>
				<FormattedMessage
					defaultMessage="Calibration Information"
					id="drawings.form.calibrationInformation"
				/>
			</Title>
			<SubTitle>
				<FormattedMessage
					defaultMessage="This sets the vertical axis limits of the drawing in relation to the model"
					id="drawings.form.calibrationInformation.description"
				/>
			</SubTitle>
			<DoubleInputLineContainer $hideBottomExtentError={hideBottomExtentError}>
				<FormNumberField
					control={control}
					name="calibration.verticalRange.0"
					label={formatMessage({ id: 'drawings.form.bottomExtent', defaultMessage: 'Bottom Extent' })}
					formError={errors.calibration?.verticalRange?.[0]}
					disabled={!isProjectAdmin}
					required
				/>
				<FormNumberField
					control={control}
					name="calibration.verticalRange.1"
					label={formatMessage({ id: 'drawings.form.topExtent', defaultMessage: 'Top Extent' })}
					formError={errors.calibration?.verticalRange?.[1]}
					disabled={!isProjectAdmin}
					required
				/>
			</DoubleInputLineContainer>
			<FormSelect
				required
				control={control}
				label={formatMessage({ id: 'drawings.form.units', defaultMessage: 'Units' })}
				name="calibration.units"
				formError={errors.calibration?.units}
				disabled={!isProjectAdmin}
			>
				{MODEL_UNITS.map(({ value, name }) => (
					<MenuItem key={value} value={value}>{name}</MenuItem>
				))}
			</FormSelect>
			<UnhandledErrorInterceptor expectedErrorValidators={[nameAlreadyExists, numberAlreadyExists]} />
		</>
	);
};