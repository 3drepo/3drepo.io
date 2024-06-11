/**
 *  Copyright (C) 2020 3D Repo Ltd
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
import { FunctionComponent } from 'react';
import InputLabel from '@mui/material/InputLabel';
import { Field } from 'formik';

import RisksIcon from '@assets/icons/outlined/safetibase-outlined.svg'
import {
	LEVELS_OF_RISK,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
} from '../../../../../../constants/risks';
import { LONG_TEXT_CHAR_LIM } from '../../../../../../constants/viewerGui';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { TextField } from '../../../../../components/textField/textField.component';
import { UpdateButtons } from '../../../updateButtons/updateButtons.component';
import { AutoSuggestField } from '../autoSuggestField/autosuggestField.component';
import { LevelOfRisk } from '../levelOfRisk/levelOfRisk.component';
import { NAMED_MONTH_DATETIME_FORMAT } from '../../../../../../services/formatting/formatDate';
import { DateField } from '../../../../../components/dateField/dateField.component';

import {
	Container,
	Content,
	DescriptionImage,
	FieldsContainer,
	FieldsRow,
	StyledFormControl,
} from '../riskDetails/riskDetails.styles';
import { RiskSchema } from '../riskDetails/riskDetails.schema';
import { DateFieldContainer, RiskLevelIconResizer } from './mainRiskFormTab.styles';

interface IProps {
	risk: any;
	active: boolean;
	isNewRisk: boolean;
	canComment: boolean;
	canEditBasicProperty: boolean;
	canEditViewpoint: boolean;
	jobs: any[];
	disableViewer?: boolean;
	values?: any;
	criteria: any;
	hasPin: boolean;
	onSavePin: (position) => void;
	onChangePin: (pin) => void;
	onUpdateViewpoint: () => void;
	onTakeScreenshot: () => void;
	onUploadScreenshot: (image) => void;
	showScreenshotDialog: (config: any) => void;
}

export const MainRiskFormTab: FunctionComponent<IProps> = ({
	active, isNewRisk, risk, disableViewer, jobs, canComment, canEditBasicProperty,
	canEditViewpoint, values, criteria, ...props
}) => {
	const getCategories = () => {
		const { category = [] } = criteria;
		return category.map((x) => ({ label: x, value: x }));
	};

	return (
		<Content active={active} id="risks-card-details">
			<Container>
				<Field name="desc" render={({ field }) => (
					<TextField
						{...field}
						requiredConfirm={!isNewRisk}
						validationSchema={RiskSchema}
						fullWidth
						multiline
						label="Description"
						disabled={!canEditBasicProperty}
						mutable={!isNewRisk}
						enableMarkdown
						inputProps={{ maxLength: LONG_TEXT_CHAR_LIM }}
						placeholder="Type a description"
						disableShowDefaultUnderline
						className="description"
					/>
				)} />
			</Container>

			{risk.descriptionThumbnail && (
				<DescriptionImage
					src={risk.descriptionThumbnail}
					enablePreview
				/>
			)}

			<FieldsRow container alignItems="center" justifyContent="space-between">
				<UpdateButtons
					isNew={isNewRisk}
					disableViewer={disableViewer}
					canEditViewpoint={canEditViewpoint}
					hasNoPermission={!canEditBasicProperty}
					onChangePin={props.onChangePin}
					onSavePin={props.onSavePin}
					onUpdateViewpoint={props.onUpdateViewpoint}
					onTakeScreenshot={props.onTakeScreenshot}
					onUploadScreenshot={props.onUploadScreenshot}
					onShowScreenshotDialog={props.showScreenshotDialog}
					hasImage={risk.descriptionThumbnail}
					hasPin={props.hasPin}
				/>
			</FieldsRow>

			<FieldsRow container alignItems="center" justifyContent="space-between">
				<FieldsContainer size={'wide'}>
					<StyledFormControl>
						<InputLabel shrink htmlFor="likelihood">Risk Likelihood</InputLabel>
						<Field name="likelihood" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_LIKELIHOODS}
								inputId="likelihood"
								disabled={!canComment}
							/>
						)} />
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink htmlFor="consequence">Risk Consequence</InputLabel>
						<Field name="consequence" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_CONSEQUENCES}
								inputId="consequence"
								disabled={!canComment}
							/>
						)} />
					</StyledFormControl>
				</FieldsContainer>

				<FieldsContainer size={'tight'}>
					<StyledFormControl>
						<RiskLevelIconResizer>
							<LevelOfRisk header="Level of Risk" level={values.level_of_risk} Icon={RisksIcon} />
						</RiskLevelIconResizer>
						<Field name="level_of_risk" render={({ field }) => (
							<CellSelect
								{...field}
								items={LEVELS_OF_RISK}
								inputId="level_of_risk"
								disabled
								readOnly
								hidden
							/>
						)} />
					</StyledFormControl>
				</FieldsContainer>
			</FieldsRow>

			<FieldsRow container alignItems="center" justifyContent="space-between">
				<StyledFormControl>
					<InputLabel shrink htmlFor="assigned_roles">Risk owner</InputLabel>
					<Field name="assigned_roles" render={({ field }) => (
						<CellSelect
							{...field}
							items={jobs}
							inputId="assigned_roles"
							disabled={!(isNewRisk || canComment)}
						/>
					)} />
				</StyledFormControl>

				<StyledFormControl>
					<InputLabel shrink htmlFor="category">Category</InputLabel>
					<Field name="category" render={({ field }) => (
						<CellSelect
							{...field}
							items={getCategories()}
							inputId="category"
							disabled={!canComment}
						/>
					)} />
				</StyledFormControl>
			</FieldsRow>

			<FieldsRow container alignItems="center" justifyContent="space-between">
				<StyledFormControl>
					<Field name="associated_activity" render={({ field, form }) => (
						<AutoSuggestField
							label="Associated Activity"
							suggestions={criteria.associated_activity}
							form={form}
							field={field}
							disabled={!canComment}
							saveOnChange={isNewRisk}
						/>
					)} />
				</StyledFormControl>
				<StyledFormControl>
					<Field name="element" render={({ field, form }) => (
						<AutoSuggestField
							label="Element type"
							suggestions={criteria.element}
							form={form}
							field={field}
							disabled={!canComment}
							saveOnChange={isNewRisk}
						/>
					)} />
				</StyledFormControl>
			</FieldsRow>

			<FieldsRow container alignItems="center" justifyContent="space-between">
				<FieldsContainer>
					<Field name="risk_factor" render={({ field, form }) => (
						<AutoSuggestField
							label="Risk factor"
							suggestions={criteria.risk_factor}
							form={form}
							field={field}
							disabled={!canComment}
							saveOnChange={isNewRisk}
						/>
					)} />
					<Field name="location_desc" render={({ field, form }) => (
						<AutoSuggestField
							label="Location"
							suggestions={criteria.location_desc}
							form={form}
							field={field}
							disabled={!canComment}
							saveOnChange={isNewRisk}
						/>
					)} />
				</FieldsContainer>
				<FieldsContainer>
					<Field name="scope" render={({ field, form }) => (
						<AutoSuggestField
							label="Construction Scope"
							suggestions={criteria.scope}
							form={form}
							field={field}
							disabled={!canComment}
							saveOnChange={isNewRisk}
						/>
					)} />
					<StyledFormControl>
						<InputLabel shrink>Due date</InputLabel>
						<Field name="due_date" render={({ field }) => (
							<DateFieldContainer>
								<DateField
									{...field}
									dateTime
									inputFormat={NAMED_MONTH_DATETIME_FORMAT}
									disabled={!canEditBasicProperty}
									placeholder="Choose a due date"
								/>
							</DateFieldContainer>
						)} />
					</StyledFormControl>
				</FieldsContainer>
				<Field name="safetibase_id" render={({ field }) => (
					<input {...field} type="hidden" name="safetibase_id" disabled />
				)} />
			</FieldsRow>
		</Content>
	);
};
