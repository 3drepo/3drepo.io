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
import { isEmpty, omitBy, pick } from 'lodash';

import {
	LEVELS_OF_RISK,
	LEVELS_RENDER_VALUE,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
	RISK_MITIGATION_STATUSES
} from '../../../../../../constants/risks';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { TextField } from '../../../../../components/textField/textField.component';
import { ContainedButton } from '../../../containedButton/containedButton.component';
import { AutoSuggestField } from '../autoSuggestField/autosuggestField.component';
import { LevelOfRisk } from '../levelOfRisk/levelOfRisk.component';
import {
	Container,
	FieldsContainer,
	FieldsRow,
	StyledFormControl,
	SuggestionButtonWrapper,
} from '../riskDetails/riskDetails.styles';
import { RiskSchema } from '../riskDetails/riskDetails.schema';
import { Content } from './treatmentFormTab.styles';

const FIELDS_FOR_MITIGATION_SUGGESTIONS = [
	'associated_activity', 'category', 'element', 'location_desc', 'risk_factor', 'scope',
];

const getMitigationSuggestionsFields = (values) => omitBy(pick(values, FIELDS_FOR_MITIGATION_SUGGESTIONS), isEmpty);

interface IProps {
	active: boolean;
	isNewRisk: boolean;
	canComment: boolean;
	values?: any;
	criteria: any;
	showDialog: (config: any) => void;
	showMitigationSuggestions: (conditions: any, setFieldValue) => void;
	setFieldValue: (name: string, value: string) => void;
}

export const TreatmentRiskFormTab: FunctionComponent<IProps> = ({
	active, isNewRisk, canComment, values, criteria, showDialog,
	showMitigationSuggestions, setFieldValue
}) => {
	const handleSuggestionClick = () => {
		showMitigationSuggestions(getMitigationSuggestionsFields(values), setFieldValue);
	};

	return (
		<Content active={active}>
			<Container top>
				<SuggestionButtonWrapper>
					<ContainedButton onClick={handleSuggestionClick} disabled={!canComment}>
						Suggest
					</ContainedButton>
				</SuggestionButtonWrapper>
				<Field name="mitigation_desc" render={({ field }) => (
					<TextField
						{...field}
						requiredConfirm={!isNewRisk}
						validationSchema={RiskSchema}
						fullWidth
						multiline
						label="Treatment"
						disabled={!canComment}
						mutable={!isNewRisk}
					/>
				)} />
			</Container>

			<Container>
				<Field name="mitigation_detail" render={({ field }) => (
					<TextField
						{...field}
						requiredConfirm={!isNewRisk}
						fullWidth
						multiline
						label="Treatment Details"
						disabled={!canComment}
						mutable={!isNewRisk}
						expandable={Number(!isNewRisk && active)}
					/>
				)} />
			</Container>

			<FieldsRow container alignItems="center" justifyContent="space-between">
				<StyledFormControl>
					<Field name="mitigation_stage" render={({ field, form }) => (
						<AutoSuggestField
							label="Stage"
							suggestions={criteria.mitigation_stage}
							form={form}
							field={field}
							disabled={!canComment}
							saveOnChange={isNewRisk}
						/>
					)} />
				</StyledFormControl>
				<StyledFormControl>
					<Field name="mitigation_type" render={({ field, form }) => (
						<AutoSuggestField
							label="Type"
							suggestions={criteria.mitigation_type}
							form={form}
							field={field}
							disabled={!canComment}
							saveOnChange={isNewRisk}
						/>
					)} />
				</StyledFormControl>
			</FieldsRow>

			<Container>
				<StyledFormControl>
					<InputLabel shrink htmlFor="mitigation_status">Treatment Status</InputLabel>
					<Field name="mitigation_status" render={({ field }) => (
						<CellSelect
							{...field}
							items={RISK_MITIGATION_STATUSES}
							inputId="mitigation_status"
							disabled={!canComment}
						/>
					)} />
				</StyledFormControl>
			</Container>

			<FieldsRow container alignItems="center" justifyContent="space-between">
				<FieldsContainer size={'wide'}>
					<StyledFormControl>
						<InputLabel shrink htmlFor="residual_likelihood">Treated Risk Likelihood</InputLabel>
						<Field name="residual_likelihood" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_LIKELIHOODS}
								inputId="residual_likelihood"
								disabled={!canComment}
								renderValue={(val: number) => LEVELS_RENDER_VALUE[val]}
							/>
						)} />
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink htmlFor="residual_consequence">Treated Risk Consequence</InputLabel>
						<Field name="residual_consequence" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_CONSEQUENCES}
								inputId="residual_consequence"
								disabled={!canComment}
							/>
						)} />
					</StyledFormControl>
				</FieldsContainer>

				<FieldsContainer size={'tight'}>
					<StyledFormControl>
						<LevelOfRisk
							header="Treated Level of Risk"
							level={values.residual_level_of_risk}
							status={values.mitigation_status}
						/>
						<Field name="residual_level_of_risk" render={({ field }) => (
							<CellSelect
								{...field}
								items={LEVELS_OF_RISK}
								inputId="residual_level_of_risk"
								disabled
								readOnly
								hidden
							/>
						)} />
					</StyledFormControl>
				</FieldsContainer>
			</FieldsRow>

			<Container>
				<Field name="residual_risk" render={({ field }) => (
					<TextField
						{...field}
						requiredConfirm={!isNewRisk}
						validationSchema={RiskSchema}
						fullWidth
						multiline
						label="Residual Risk"
						disabled={!canComment}
						mutable={!isNewRisk}
					/>
				)} />
			</Container>
		</Content>
	);
};
