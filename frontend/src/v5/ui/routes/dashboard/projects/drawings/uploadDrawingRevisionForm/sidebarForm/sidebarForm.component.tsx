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
import { FieldError, useFormContext } from 'react-hook-form';
import { MenuItem } from '@mui/material';
import { FormNumberField, FormSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { get, isNumber } from 'lodash';
import { Heading, Title, FlexContainer } from './sidebarForm.styles';
import { useContext, useEffect } from 'react';
import { UploadFilesContext } from '@components/shared/uploadFiles/uploadFilesContext';
import { DrawingRevisionsHooksSelectors, DrawingsHooksSelectors, ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { MODEL_UNITS } from '../../../models.helpers';
import { DoubleInputLineContainer } from '../../drawingDialogs/drawingForm.styles';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { DrawingRevisionsActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { CALIBRATION_INVALID_RANGE_ERROR } from '@/v5/validation/drawingSchemes/drawingSchemes';
import { UploadDrawingFormType } from '@/v5/store/drawings/revisions/drawingRevisions.types';

export const SidebarForm = () => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const types = DrawingsHooksSelectors.selectTypes();
	const { getValues, formState: { errors, dirtyFields }, trigger, watch } = useFormContext<UploadDrawingFormType>();
	const { fields, selectedId } = useContext(UploadFilesContext);
	// @ts-ignore
	const selectedIndex: number = fields.findIndex(({ uploadId }) => uploadId === selectedId);
	const revisionPrefix = `uploads.${selectedIndex}` as `uploads.${number}`;
	const [drawingId, drawingName] = getValues([`${revisionPrefix}.drawingId`, `${revisionPrefix}.drawingName`]);
	const disableDrawingFields = !(drawingName && !drawingId);
	const getError = (field: string) => get(errors, `${revisionPrefix}.${field}`);
	const verticalRange = watch(`${revisionPrefix}.calibration.verticalRange`);
	const hasActiveRevisions = DrawingsHooksSelectors.selectRawDrawingById(drawingId).revisionsCount > 0;
	const hasPendingRevisions = !!DrawingRevisionsHooksSelectors.selectRevisionsPending(drawingId);
	const drawingRevisionsArePending = !!DrawingRevisionsHooksSelectors.selectIsPending(drawingId);
	const needsFetchingCalibration = hasActiveRevisions && (hasPendingRevisions || drawingRevisionsArePending) && !isNumber(verticalRange[0]);
	const hideBottomExtentError = (errors.uploads?.[selectedIndex]?.calibration?.verticalRange || []).some((e) => e.message === CALIBRATION_INVALID_RANGE_ERROR);

	useEffect(() => {
		if (get(dirtyFields, `${revisionPrefix}.calibration.verticalRange`)?.some((v) => v)) {
			trigger(`${revisionPrefix}.calibration.verticalRange`);
		}
	}, [verticalRange?.[0], verticalRange?.[1]]);

	useEffect(() => {
		if (!needsFetchingCalibration || drawingRevisionsArePending) return;

		if (!hasPendingRevisions) {
			DrawingRevisionsActionsDispatchers.fetch(
				teamspace,
				project,
				drawingId,
			);
			return;
		}
		DrawingsActionsDispatchers.fetchCalibration(teamspace, project, drawingId);
	}, [drawingId, hasActiveRevisions, hasPendingRevisions, drawingRevisionsArePending, isNumber(verticalRange[0])]);

	if (needsFetchingCalibration) return <Loader />;

	return (
		<>
			<Title>{drawingName}</Title>
			<FlexContainer>
				<FormTextField
					name={`${revisionPrefix}.drawingNumber`}
					label={formatMessage({ id: 'drawing.uploads.sidebar.drawing.drawingNumber', defaultMessage: 'Drawing Number' })}
					formError={getError('drawingNumber')}
					disabled={disableDrawingFields}
					required
				/>
				<FormSelect
					name={`${revisionPrefix}.drawingType`}
					label={formatMessage({ id: 'drawing.uploads.sidebar.drawing.type', defaultMessage: 'Category' })}
					formError={getError('drawingType')}
					disabled={disableDrawingFields}
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
					disabled={disableDrawingFields}
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
					disabled={disableDrawingFields}
					required
				/>
				<FormNumberField
					name={`${revisionPrefix}.calibration.verticalRange.1`}
					formError={getError('calibration.verticalRange.1') ? {} : ''}
					label={formatMessage({ id: 'drawings.form.topExtent', defaultMessage: 'Top Extent' })}
					required
					disabled={disableDrawingFields}
					defaultValue={1}
				/>
			</DoubleInputLineContainer>
			<FormSelect
				name={`${revisionPrefix}.calibration.units`}
				formError={getError('units')}
				label={formatMessage({ id: 'drawings.form.units', defaultMessage: 'Units' })}
				defaultValue="mm"
				disabled={disableDrawingFields}
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
