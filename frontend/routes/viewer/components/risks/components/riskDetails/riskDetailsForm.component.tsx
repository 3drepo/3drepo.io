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

import * as React from 'react';
import * as Yup from 'yup';
import { debounce, get, isEmpty, isEqual } from 'lodash';
import { connect, Field, Form, withFormik, Formik } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';

import {
	LEVELS_OF_RISK,
	RISK_CATEGORIES,
	RISK_CONSEQUENCES,
	RISK_LIKELIHOODS,
	RISK_MITIGATION_STATUSES
} from '../../../../../../constants/risks';
import { calculateLevelOfRisk } from '../../../../../../helpers/risks';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';
import { TextField } from '../../../../../components/textField/textField.component';
import { Container, FieldsContainer, FieldsRow, StyledFormControl, DescriptionImage } from './riskDetails.styles';
import { Image } from '../../../../../components/image';

export const RiskSchema = Yup.object().shape({
	description: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	mitigation_desc: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING),
	residual_risk: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

interface IProps {
	canUpdateRisk: boolean;
	risk: any;
	jobs: any[];
	values: any;
	formik: any;
	associatedActivities: any[];
	permissions: any;
	currentUser: any;
	myJob: any;
	onSubmit: (values) => void;
	onValueChange: (event) => void;
	handleChange: (event) => void;
	handleSubmit: () => void;
}

interface IState {
	isSaving: boolean;
}

class RiskDetailsFormComponent extends React.PureComponent<IProps, IState> {
	public static defaultProps = {
		canUpdateRisk: false
	};

	public state = {
		isSaving: false
	};

	get isNewRisk() {
		return !this.props.risk._id;
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const { values, formik } = this.props;
		const valuesChanged = !isEqual(prevProps.values, values);

		if (formik.dirty) {
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

	public updateRiskLevel = async (likelihoodPath, consequencePath, riskLevelPath) => {
		const { formik } = this.props;
		const levelsOfRisk = {
			level_of_risk: formik.values.level_of_risk,
			residual_level_of_risk: formik.values.residual_level_of_risk
		};
		levelsOfRisk[riskLevelPath] = calculateLevelOfRisk(formik.values[likelihoodPath], formik.values[consequencePath]);
		formik.setFieldValue(riskLevelPath, levelsOfRisk[riskLevelPath]);
		if (0 <= levelsOfRisk.residual_level_of_risk) {
			formik.setFieldValue('overall_level_of_risk', levelsOfRisk.residual_level_of_risk);
		} else {
			formik.setFieldValue('overall_level_of_risk', levelsOfRisk.level_of_risk);
		}
	}

	public autoSave = debounce(() => {
		const { formik, handleSubmit } = this.props;
		if (!formik.isValid) {
			return;
		}

		this.setState({ isSaving: true }, () => {
			this.props.formik.setFieldValue();
			handleSubmit();
			this.setState({ isSaving: false });
		});
	}, 200);

	public handleChangeAndSubmit = (event) => {
		event.persist();
		this.props.handleChange(event);
		this.props.handleSubmit();
	}

	public render() {
		return (
			<Form>
				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="assigned_roles">Risk owner</InputLabel>
						<Field name="assigned_roles" render={({ field }) => (
							<CellSelect
								{...field}
								items={this.props.jobs}
								inputId="assigned_roles"
								disabled={!this.props.canUpdateRisk}
							/>
						)} />
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="category">Category</InputLabel>
						<Field name="category" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_CATEGORIES}
								inputId="category"
								disabled={!this.props.canUpdateRisk}
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
							disabled={!this.props.canUpdateRisk}
						/>
					)} />

					<Field name="safetibase_id" render={({ field }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewRisk}
							validationSchema={RiskSchema}
							label="SafetiBase ID"
							disabled={!this.props.canUpdateRisk}
						/>
					)} />
				</FieldsRow>

				<Container>
					<Field name="description" render={({ field, form }) => (
						<TextField
							{...field}
							requiredConfirm={!this.isNewRisk}
							validationSchema={RiskSchema}
							fullWidth
							multiline
							label="Description"
							disabled={!this.props.canUpdateRisk}
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
							<InputLabel shrink={true} htmlFor="likelihood">Risk Likelihood</InputLabel>
							<Field name="likelihood" render={({ field }) => (
								<CellSelect
									{...field}
									items={RISK_LIKELIHOODS}
									inputId="likelihood"
									disabled={!this.props.canUpdateRisk}
									readOnly={!this.isNewRisk}
								/>
							)} />
						</StyledFormControl>

						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="consequence">Risk Consequence</InputLabel>
							<Field name="consequence" render={({ field }) => (
								<CellSelect
									{...field}
									items={RISK_CONSEQUENCES}
									inputId="consequence"
									disabled={!this.props.canUpdateRisk}
									readOnly={!this.isNewRisk}
								/>
							)} />
						</StyledFormControl>
					</FieldsContainer>

					<FieldsContainer>
						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="level_of_risk">Level of Risk</InputLabel>
							<Field name="level_of_risk" render={({ field }) => (
								<CellSelect
									{...field}
									items={LEVELS_OF_RISK}
									inputId="level_of_risk"
									disabled={true}
									readOnly
								/>
							)} />
						</StyledFormControl>
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
							disabled={!this.props.canUpdateRisk}
						/>
					)} />
				</Container>

				<Container>
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="mitigation_status">Mitigation Status</InputLabel>
						<Field name="mitigation_status" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_MITIGATION_STATUSES}
								inputId="mitigation_status"
								disabled={!this.props.canUpdateRisk}
							/>
						)} />
					</StyledFormControl>
				</Container>

				<FieldsRow container alignItems="center" justify="space-between">
					<FieldsContainer>
						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="residual_likelihood">Mitigated Likelihood</InputLabel>
							<Field name="residual_likelihood" render={({ field }) => (
								<CellSelect
									{...field}
									items={RISK_LIKELIHOODS}
									inputId="residual_likelihood"
									disabled={!this.props.canUpdateRisk}
								/>
							)} />
						</StyledFormControl>

						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="residual_consequence">Mitigated Consequence</InputLabel>
							<Field name="residual_consequence" render={({ field }) => (
								<CellSelect
									{...field}
									items={RISK_CONSEQUENCES}
									inputId="residual_consequence"
									disabled={!this.props.canUpdateRisk}
								/>
							)} />
						</StyledFormControl>
					</FieldsContainer>

					<FieldsContainer>
						<StyledFormControl>
							<InputLabel shrink={true} htmlFor="residual_level_of_risk">Level of Mitigated Risk</InputLabel>
							<Field name="residual_level_of_risk" render={({ field }) => (
								<CellSelect
									{...field}
									items={LEVELS_OF_RISK}
									inputId="residual_level_of_risk"
									disabled={true}
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
							disabled={!this.props.canUpdateRisk}
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
			description: risk.description || '',
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
})(connect(RiskDetailsFormComponent as any)) as any;
