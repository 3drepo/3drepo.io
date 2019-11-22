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

import { withFormik, Field, Form } from 'formik';
import { debounce, get, isEmpty, isEqual } from 'lodash';
import React from 'react';
import * as Yup from 'yup';

import InputLabel from '@material-ui/core/InputLabel';
import {
	LEVELS_OF_RISK,
	RISK_CATEGORIES,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
	RISK_MITIGATION_STATUSES
} from '../../../../../../constants/risks';
import { renderWhenTrue } from '../../../../../../helpers/rendering';
import { calculateLevelOfRisk } from '../../../../../../helpers/risks';
import { canChangeAssigned, canChangeBasicProperty, canChangeStatus } from '../../../../../../helpers/risks';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { Image } from '../../../../../components/image';
import { TextField } from '../../../../../components/textField/textField.component';
import PinButton from '../../../pinButton/pinButton.container';
import { Container, DescriptionImage, FieldsContainer, FieldsRow, StyledFormControl } from './riskDetails.styles';

interface IProps {
	risk: any;
	jobs: any[];
	formik: any;
	values: any;
	associatedActivities: any[];
	permissions: any;
	currentUser: any;
	myJob: any;
	isValid: boolean;
	dirty: boolean;
	onSubmit: (values) => void;
	onValueChange: (event) => void;
	handleChange: (event) => void;
	handleSubmit: () => void;
	onSavePin: (position) => void;
	onChangePin: (pin) => void;
	setFieldValue: (fieldName, fieldValue) => void;
	hasPin: boolean;
	hidePin?: boolean;
}

interface IState {
	isSaving: boolean;
}

export const RiskSchema = Yup.object().shape({
	description: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	mitigation_desc: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	residual_risk: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

class RiskDetailsFormComponent extends React.PureComponent<IProps, IState> {
	get isNewRisk() {
		return !this.props.risk._id;
	}

	get canEditBasicProperty() {
		const { risk, myJob, permissions, currentUser } = this.props;
		return this.isNewRisk || canChangeBasicProperty(risk, myJob, permissions, currentUser);
	}

	public state = {
		isSaving: false
	};

	public autoSave = debounce(() => {
		const { onSubmit, isValid, values } = this.props;

		if (!isValid) {
			return;
		}

		this.setState({ isSaving: true }, () => {
			onSubmit(values);
			this.setState({ isSaving: false });
		});
	}, 200);

	public renderPinButton = renderWhenTrue(() => (
		<StyledFormControl>
			<PinButton
				onChange={this.props.onChangePin}
				onSave={this.props.onSavePin}
				disabled={!this.isNewRisk && !this.canEditBasicProperty}
				hasPin={this.props.hasPin}
			/>
		</StyledFormControl>
	));

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const { values, dirty } = this.props;
		const valuesChanged = !isEqual(prevProps.values, values);

		if (dirty) {
			if (valuesChanged && !this.state.isSaving) {
				const likelihoodChanged = prevProps.values.likelihood !== values.likelihood;
				const consequenceChanged = prevProps.values.consequence !== values.consequence;

				if (likelihoodChanged || consequenceChanged) {
					this.updateRiskLevel('likelihood', 'consequence', 'level_of_risk');
				}

				const residualLikelihoodChanged = prevProps.values.residual_likelihood !== values.residual_likelihood;
				const residualConsequenceChanged = prevProps.values.residual_consequence !== values.residual_consequence;

				if (residualLikelihoodChanged || residualConsequenceChanged) {
					this.updateRiskLevel('residual_likelihood', 'residual_consequence', 'residual_level_of_risk');
				}

				this.autoSave();
			}

			if (valuesChanged && this.state.isSaving) {
				changes.isSaving = false;
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public updateRiskLevel = (likelihoodPath, consequencePath, riskLevelPath) => {
		const { values, setFieldValue } = this.props;
		const levelsOfRisk = {
			level_of_risk: values.level_of_risk,
			residual_level_of_risk: values.residual_level_of_risk
		};
		levelsOfRisk[riskLevelPath] = calculateLevelOfRisk(values[likelihoodPath], values[consequencePath]);
		setFieldValue(riskLevelPath, levelsOfRisk[riskLevelPath]);
		if (0 <= levelsOfRisk.residual_level_of_risk) {
			setFieldValue('overall_level_of_risk', levelsOfRisk.residual_level_of_risk);
		} else {
			setFieldValue('overall_level_of_risk', levelsOfRisk.level_of_risk);
		}
	}

	public render() {
		const { risk, myJob, permissions, currentUser } = this.props;
		const newRisk = !risk._id;
		const canEditRiskStatus = newRisk || canChangeStatus(risk, myJob, permissions, currentUser);

		return (
			<Form>
				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink htmlFor="assigned_roles">Risk owner</InputLabel>
						<Field name="assigned_roles" render={({ field }) => (
							<CellSelect
								{...field}
								items={this.props.jobs}
								inputId="assigned_roles"
								disabled={!(newRisk || canChangeAssigned(risk, myJob, permissions, currentUser))}
							/>
						)} />
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink htmlFor="category">Category</InputLabel>
						<Field name="category" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_CATEGORIES}
								inputId="category"
								disabled={!this.canEditBasicProperty}
							/>
						)} />
					</StyledFormControl>
				</FieldsRow>

				<FieldsRow container alignItems="center" justify="space-between">
					<Field name="associated_activity" render={({ field }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewRisk}
							label="Associated Activity"
							disabled={!this.canEditBasicProperty}
						/>
					)} />

					<Field name="safetibase_id" render={({ field }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewRisk}
							validationSchema={RiskSchema}
							label="SafetiBase ID"
							disabled={!this.canEditBasicProperty}
						/>
					)} />
				</FieldsRow>

				<Container>
					<Field name="desc" render={({ field }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewRisk}
							validationSchema={RiskSchema}
							fullWidth
							multiline
							label="Description"
							disabled={!this.canEditBasicProperty}
							mutable={!this.isNewRisk}
						/>
					)} />
				</Container>

				{this.props.risk.descriptionThumbnail && (
					<DescriptionImage>
						<Image
							src={this.props.risk.descriptionThumbnail}
							enablePreview
						/>
					</DescriptionImage>
				)}

				<FieldsRow container alignItems="center" justify="space-between">
					<FieldsContainer>
						<StyledFormControl>
							<InputLabel shrink htmlFor="likelihood">Risk Likelihood</InputLabel>
							<Field name="likelihood" render={({ field }) => (
								<CellSelect
									{...field}
									items={RISK_LIKELIHOODS}
									inputId="likelihood"
									disabled={!this.canEditBasicProperty}
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
									disabled={!this.canEditBasicProperty}
								/>
							)} />
						</StyledFormControl>
					</FieldsContainer>

					<FieldsContainer>
						<StyledFormControl>
							<InputLabel shrink htmlFor="level_of_risk">Level of Risk</InputLabel>
							<Field name="level_of_risk" render={({ field }) => (
								<CellSelect
									{...field}
									items={LEVELS_OF_RISK}
									inputId="level_of_risk"
									disabled
									readOnly
								/>
							)} />
						</StyledFormControl>
						{this.renderPinButton(!this.props.hidePin)}
					</FieldsContainer>
				</FieldsRow>

				<Container>
					<Field name="mitigation_desc" render={({ field, form }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewRisk}
							validationSchema={RiskSchema}
							fullWidth
							multiline
							label="Mitigation"
							disabled={!this.canEditBasicProperty}
							mutable={!this.isNewRisk}
						/>
					)} />
				</Container>

				<Container>
					<StyledFormControl>
						<InputLabel shrink htmlFor="mitigation_status">Mitigation Status</InputLabel>
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
					<FieldsContainer>
						<StyledFormControl>
							<InputLabel shrink htmlFor="residual_likelihood">Mitigated Likelihood</InputLabel>
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
							<InputLabel shrink htmlFor="residual_consequence">Mitigated Consequence</InputLabel>
							<Field name="residual_consequence" render={({ field }) => (
								<CellSelect
									{...field}
									items={RISK_CONSEQUENCES}
									inputId="residual_consequence"
									disabled={!canEditRiskStatus}
								/>
							)} />
						</StyledFormControl>
					</FieldsContainer>

					<FieldsContainer>
						<StyledFormControl>
							<InputLabel shrink htmlFor="residual_level_of_risk">Level of Mitigated Risk</InputLabel>
							<Field name="residual_level_of_risk" render={({ field }) => (
								<CellSelect
									{...field}
									items={LEVELS_OF_RISK}
									inputId="residual_level_of_risk"
									disabled
									readOnly
								/>
							)} />
						</StyledFormControl>
					</FieldsContainer>
				</FieldsRow>

				<Container>
					<Field name="residual_risk" render={({ field, form }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewRisk}
							validationSchema={RiskSchema}
							fullWidth
							multiline
							label="Residual Risk"
							disabled={!this.canEditBasicProperty}
							mutable={!this.isNewRisk}
						/>
					)} />
				</Container>
			</Form>
		);
	}
}

export const RiskDetailsForm = withFormik({
	mapPropsToValues: ({ risk }) => {
		return ({
			safetibase_id: risk.safetibase_id || '',
			associated_activity: risk.associated_activity || '',
			mitigation_status: risk.mitigation_status || '',
			mitigation_desc: risk.mitigation_desc || '',
			desc: risk.desc || '',
			assigned_roles: get(risk, 'assigned_roles[0]', ''),
			category: risk.category || '',
			likelihood: risk.likelihood,
			consequence: risk.consequence,
			level_of_risk: risk.level_of_risk,
			residual_likelihood: risk.residual_likelihood,
			residual_consequence: risk.residual_consequence,
			residual_level_of_risk: risk.residual_level_of_risk,
			overall_level_of_risk: risk.overall_level_of_risk,
			residual_risk: risk.residual_risk
		});
	},
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: RiskSchema
})(RiskDetailsFormComponent as any) as any;
