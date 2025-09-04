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
import { FormattedMessage } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { MenuItem } from '@mui/material';
import { FormNumberField, FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { get } from 'lodash';
import { Heading, Title, FlexContainer } from './sidebarForm.styles';
import { useContext } from 'react';
import { UploadFilesContext } from '@components/shared/uploadFiles/uploadFilesContext';
import { DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { MODEL_UNITS } from '../../../models.helpers';
import { DoubleInputLineContainer } from '../../drawingDialogs/drawingForm.styles';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { CALIBRATION_INVALID_RANGE_ERROR } from '@/v5/validation/drawingSchemes/drawingSchemes';

export const SidebarForm = () => {
	const types = DrawingsHooksSelectors.selectTypes();
	const { getValues, formState: { errors } } = useFormContext();
	const { fields, selectedId } = useContext(UploadFilesContext);
	// @ts-ignore
	const selectedIndex = fields.findIndex(({ uploadId }) => uploadId === selectedId);
	const revisionPrefix = `uploads.${selectedIndex}`;
	const [drawingId, drawingName] = getValues([`${revisionPrefix}.drawingId`, `${revisionPrefix}.drawingName`]);
	const getError = (field: string) => get(errors, `${revisionPrefix}.${field}`);

	const fetched = DrawingsHooksSelectors.selectDrawingFetched(drawingId);
	const hideBottomExtentError = (errors.calibration?.verticalRange || []).some((e) => e.message === CALIBRATION_INVALID_RANGE_ERROR);

	if (!fetched && drawingId) return <Loader />;

	return (
		<>
			<Title>{drawingName}</Title>
			<FlexContainer>
				<FormTextField
					name={`${revisionPrefix}.drawingNumber`}
					label={formatMessage({ id: 'drawing.uploads.sidebar.drawing.drawingNumber', defaultMessage: 'Drawing Number' })}
					formError={getError('drawingNumber')}
					required
				/>
				<FormSelect
					name={`${revisionPrefix}.drawingType`}
					label={formatMessage({ id: 'drawing.uploads.sidebar.drawing.type', defaultMessage: 'Category' })}
					formError={getError('drawingType')}
					required
				>
					{types.map((type) => (
						<MenuItem key={type} value={type}> {type}</MenuItem>
					))}
				</FormSelect>
				<FormTextField
					name={`${revisionPrefix}.drawingDesc`}
					label={formatMessage({ id: 'drawing.uploads.sidebar.drawing.description', defaultMessage: 'Description' })}
					formError={getError('drawingDesc')}
				/>
			</FlexContainer>
			<Heading>
				<FormattedMessage
					defaultMessage="Calibration Information"
					id="drawing.uploads.sidebar.drawing.calibrationInformation"
				/>
			</Heading>
			<DoubleInputLineContainer $hideBottomExtentError={hideBottomExtentError}>
				<FormNumberField
					name={`${revisionPrefix}.calibration.verticalRange.0`}
					formError={getError('calibration.verticalRange.0')}
					label={formatMessage({ id: 'drawings.form.bottomExtent', defaultMessage: 'Bottom Extent' })}
					defaultValue={0}
					required
				/>
				<FormNumberField
					name={`${revisionPrefix}.calibration.verticalRange.1`}
					formError={getError('calibration.verticalRange.1')}
					label={formatMessage({ id: 'drawings.form.topExtent', defaultMessage: 'Top Extent' })}
					required
					defaultValue={1}
				/>
			</DoubleInputLineContainer>
			<FormSelect
				name={`${revisionPrefix}.calibration.units`}
				formError={getError('units')}
				label={formatMessage({ id: 'drawings.form.units', defaultMessage: 'Units' })}
				defaultValue="mm"
			>
				{MODEL_UNITS.map(({ value, name }) => (
					<MenuItem key={value} value={value}>{name}</MenuItem>
				))}
			</FormSelect>
			<Heading>
				<FormattedMessage id="drawing.uploads.sidebar.drawingRevisionDetails" defaultMessage="Revision details" />
			</Heading>
			<FormTextField
				name={`${revisionPrefix}.revisionDesc`}
				label={formatMessage({ id: 'drawing.uploads.sidebar.revisionDesc', defaultMessage: 'Revision Description' })}
				formError={getError('revisionDesc')}
			/>
		</>
	);
};
