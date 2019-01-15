import * as React from 'react';
import * as Yup from 'yup';
import { pick, get } from 'lodash';
import { Formik, Field, Form, withFormik } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';

import {
	RISK_CATEGORIES,
	RISK_LIKELIHOODS,
	RISK_CONSEQUENCES,
	LEVELS_OF_RISK,
	RISK_MITIGATION_STATUSES
} from '../../../../../../constants/risks';
import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';

import {FieldsRow, StyledTextField, StyledFormControl } from './riskDetails.styles';

interface IProps {
	risk: any;
	jobs: any[];
	values: any;
	errors: any;
	onSubmit: (values) => void;
	handleChange: () => void;
}

class RiskDetailsFormComponent extends React.PureComponent<IProps, any> {
	public render() {
		const { values, errors, handleChange } = this.props;

		return (
			<Form>
				<FieldsRow container alignItems="center" justify="space-between">
					<StyledTextField
						onChange={handleChange}
						value={values.safetibase_id}
						label="GUID"
						name="safetibase_id"
					/>

					<StyledTextField
						onChange={handleChange}
						value={values.associated_activity}
						label="Associated Activity"
						name="associated_activity"
					/>
				</FieldsRow>

				<StyledTextField
					onChange={handleChange}
					value={values.desc}
					fullWidth
					multiline
					label="Description"
					name="desc"
				/>

				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="assigned_roles">Risk owner</InputLabel>
						<CellSelect
							onChange={handleChange}
							value={values.assigned_roles}
							items={this.props.jobs}
							inputId="assigned_roles"
							name="assigned_roles"
						/>
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="category">Category</InputLabel>
						<CellSelect
							name="category"
							inputId="category"
							onChange={handleChange}
							value={values.category}
							items={RISK_CATEGORIES}
						/>
					</StyledFormControl>
				</FieldsRow>

				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="likelihood">Risk Likelihood</InputLabel>
						<CellSelect
							name="likelihood"
							onChange={handleChange}
							value={values.likelihood}
							items={RISK_LIKELIHOODS}
							inputId="likelihood"
						/>
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="consequence">Risk Consequence</InputLabel>
						<CellSelect
							name="consequence"
							inputId="consequence"
							onChange={handleChange}
							value={values.consequence}
							items={RISK_CONSEQUENCES}
						/>
					</StyledFormControl>
				</FieldsRow>

				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="level_of_risk">Level of Risk</InputLabel>
						<CellSelect
							name="level_of_risk"
							onChange={handleChange}
							value={values.level_of_risk}
							items={LEVELS_OF_RISK}
							inputId="level_of_risk"
							disabled={true}
						/>
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="mitigation_status">Mitigation Status</InputLabel>
						<CellSelect
							onChange={handleChange}
							value={values.mitigation_status}
							items={RISK_MITIGATION_STATUSES}
							inputId="mitigation_status"
							name="mitigation_status"
						/>
					</StyledFormControl>
				</FieldsRow>

				<StyledTextField
					onChange={handleChange}
					value={values.mitigation_desc}
					fullWidth
					multiline
					label="Mitigation"
					name="mitigation_desc"
				/>
			</Form>
		);
	}
}

export const RiskDetailsForm = withFormik({
	mapPropsToValues: ({ risk }) => ({
		safetibase_id: risk.safetibase_id || '',
		associated_activity: risk.associated_activity || '',
		mitigation_status: risk.mitigation_status || '',
		mitigation_desc: risk.mitigation_status || '',
		description: risk.description || '',
		assigned_roles: get(risk, 'assigned_roles[0]', ''),
		name: risk.name || 'Untitled risk',
		likelihood: risk.likelihood || 0,
		consequence: risk.consequence || 0
	}),
	handleSubmit: () => {}
})(RiskDetailsFormComponent as any) as any;
