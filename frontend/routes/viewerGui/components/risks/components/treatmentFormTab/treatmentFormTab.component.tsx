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

import React from 'react';

import InputLabel from '@material-ui/core/InputLabel';
import { Field } from 'formik';
import {
	LEVELS_OF_RISK,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
	RISK_MITIGATION_STATUSES
} from '../../../../../../constants/risks';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { TextField } from '../../../../../components/textField/textField.component';
import { LevelOfRisk } from '../levelOfRisk/levelOfRisk.component';

import { Container, Content, FieldsContainer, FieldsRow, StyledFormControl } from '../riskDetails/riskDetails.styles';
import { RiskSchema } from '../riskDetails/riskDetailsForm.component';

interface IProps {
	active: boolean;
	isNewRisk: boolean;
	canEditBasicProperty: boolean;
	canEditRiskStatus: boolean;
	values?: any;
}

export const TreatmentRiskFormTab: React.FunctionComponent<IProps> = ({
	active, isNewRisk, canEditBasicProperty, canEditRiskStatus, values
}) => {
	return (
		<Content active={active}>
			<Container>
				<Field name="mitigation_desc" render={({ field }) => (
					<TextField
						{...field}
						requiredConfirm={!isNewRisk}
						validationSchema={RiskSchema}
						fullWidth
						multiline
						label="Treatment"
						disabled={!canEditBasicProperty}
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
						disabled={!canEditBasicProperty}
						mutable={!isNewRisk}
					/>
				)} />
			</Container>

			<FieldsRow container alignItems="center" justify="space-between">
				<Field name="mitigation_stage" render={({ field }) => (
					<TextField
						{...field}
						requiredConfirm={!isNewRisk}
						label="Stage"
						disabled={!canEditBasicProperty}
					/>
				)} />
				<Field name="mitigation_type" render={({ field }) => (
					<TextField
						{...field}
						requiredConfirm={!isNewRisk}
						label="Type"
						disabled={!canEditBasicProperty}
					/>
				)} />
			</FieldsRow>

			<Container>
				<StyledFormControl>
					<InputLabel shrink htmlFor="mitigation_status">Treatment Status</InputLabel>
					<Field name="mitigation_status" render={({ field }) => (
						<CellSelect
							{...field}
							items={RISK_MITIGATION_STATUSES}
							inputId="mitigation_status"
							disabled={!canEditRiskStatus}
						/>
					)} />
				</StyledFormControl>
			</Container>

			<FieldsRow container alignItems="center" justify="space-between">
				<FieldsContainer size={'wide'}>
					<StyledFormControl>
						<InputLabel shrink htmlFor="residual_likelihood">Treated Risk Likelihood</InputLabel>
						<Field name="residual_likelihood" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_LIKELIHOODS}
								inputId="residual_likelihood"
								disabled={!canEditRiskStatus}
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
								disabled={!canEditBasicProperty}
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
				<Field name="residual_risk" render={({ field, form }) => (
					<TextField
						{...field}
						requiredConfirm={!isNewRisk}
						validationSchema={RiskSchema}
						fullWidth
						multiline
						label="Residual Risk"
						disabled={!canEditBasicProperty}
						mutable={!isNewRisk}
					/>
				)} />
			</Container>
		</Content>
	);
};
