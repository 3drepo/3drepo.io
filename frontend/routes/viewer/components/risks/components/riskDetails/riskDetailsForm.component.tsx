import * as React from 'react';
import * as Yup from 'yup';
import { pick, get, isEqual, isEmpty, debounce } from 'lodash';
import { Field, Form, withFormik, connect } from 'formik';
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
	formik: any;
	onSubmit: (values) => void;
	onValueChange: (event) => void;
	handleChange: (event) => void;
	handleSubmit: () => void;
}

interface IState {
	isSaving: boolean;
}

class RiskDetailsFormComponent extends React.PureComponent<IProps, IState> {
	public formRef = React.createRef();

	public state = {
		isSaving: false
	};

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const valuesChanged = !isEqual(prevProps.values, this.props.values);
		if (valuesChanged && !this.state.isSaving) {
			this.autoSave();
		}

		if (valuesChanged && this.state.isSaving) {
			changes.isSaving = false;
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public autoSave = debounce(() => {
		const { formik, handleSubmit } = this.props;
		if (!formik.isValid) {
			return;
		}

		this.setState({ isSaving: true }, () => {
			debugger;
			handleSubmit();
			this.setState({ isSaving: false });
		});
	}, 200);

	public handleChangeAndSubmit = (event, ...args) => {
		event.persist();
		this.props.handleChange(event);
		this.props.handleSubmit();
	}

	public render() {
		return (
			<Form>
				<FieldsRow container alignItems="center" justify="space-between">
					<Field name="safetibase_id" render={({ field }) => (
						<StyledTextField
							{...field}
							label="GUID"
						/>
					)} />

					<Field name="associated_activity" render={({ field }) => (
						<StyledTextField
							{...field}
							label="Associated Activity"
						/>
					)} />
				</FieldsRow>

				<Field name="description" render={({ field }) => (
					<StyledTextField
						{...field}
						fullWidth
						multiline
						label="Description"
					/>
				)} />

				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="assigned_roles">Risk owner</InputLabel>
						<Field name="assigned_roles" render={({ field }) => (
							<CellSelect
								{...field}
								items={this.props.jobs}
								inputId="assigned_roles"
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
							/>
						)} />
					</StyledFormControl>
				</FieldsRow>

				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="likelihood">Risk Likelihood</InputLabel>
						<Field name="likelihood" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_LIKELIHOODS}
								inputId="likelihood"
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
							/>
						)} />
					</StyledFormControl>
				</FieldsRow>

				<FieldsRow container alignItems="center" justify="space-between">
					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="level_of_risk">Level of Risk</InputLabel>
						<Field name="level_of_risk" render={({ field }) => (
							<CellSelect
								{...field}
								items={LEVELS_OF_RISK}
								inputId="level_of_risk"
								disabled={true}
							/>
						)} />
					</StyledFormControl>

					<StyledFormControl>
						<InputLabel shrink={true} htmlFor="mitigation_status">Mitigation Status</InputLabel>
						<Field name="mitigation_status" render={({ field }) => (
							<CellSelect
								{...field}
								items={RISK_MITIGATION_STATUSES}
								inputId="mitigation_status"
							/>
						)} />
					</StyledFormControl>
				</FieldsRow>

				<Field name="mitigation_desc" render={({ field }) => (
					<StyledTextField
						{...field}
						fullWidth
						multiline
						label="Mitigation"
					/>
				)} />
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
		consequence: risk.consequence || 0,
		level_of_risk: risk.level_of_risk || 0

	}),
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true
})(connect(RiskDetailsFormComponent as any)) as any;
