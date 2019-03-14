import * as React from 'react';
import * as Yup from 'yup';
import * as dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { Field, Form, Formik } from 'formik';
import { Select } from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import { GROUPS_TYPES_LIST, GROUPS_TYPES } from '../../../../../../constants/groups';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { FieldsRow, StyledFormControl, StyledTextField, Description, LongLabel } from './groupDetails.styles';

const GroupSchema = Yup.object().shape({
	description: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

interface IProps {
	group: any;
	currentUser: any;
	totalMeshes: number;
	canUpdate: boolean;
	fieldNames: any[];
	selectedNodes: any[];
	onSubmit: () => void;
	handleChange: (event) => void;
	setIsFormValid: (isFormValid) => void;
	setIsFormDirty: (isFormDirty) => void;
}

export class GroupDetailsForm extends React.PureComponent<IProps, any> {
	get isNewGroup() {
		return !this.props.group._id;
	}

	public formikRef = React.createRef<HTMLElement>() as any;

	public componentDidMount() {
		this.props.setIsFormValid(this.isNewGroup);
	}

	public componentDidUpdate(prevProps) {
		const { name, description, color, rules, type, objects } = this.props.group;
		const currentValues = { name, description, color, rules, type };
		const initialValues = this.formikRef.current.initialValues;
		const groupChanged = !isEqual(this.props.group, prevProps.group);
		const isNormalGroup = this.props.group.type === GROUPS_TYPES.NORMAL;
		const sharedIdsChanged = isNormalGroup ? this.areSharedIdsChanged(this.props.selectedNodes, objects) : false;

		const isFormDirtyAndValid = (!isEqual(initialValues, currentValues) && groupChanged) || sharedIdsChanged;
		this.props.setIsFormValid(isFormDirtyAndValid);
		this.props.setIsFormDirty(isFormDirtyAndValid);
	}

	public areSharedIdsChanged = (selectedNodes = [], groupObjects = []) => {
		if (!selectedNodes.length && !groupObjects.length) {
			return false;
		}

		if (!selectedNodes.length) {
			return groupObjects.reduce((acc, curr) => {
				return curr.shared_ids ? acc + curr.shared_ids.length : 0;
			}, 0);
		}

		if (!groupObjects.length) {
			return selectedNodes.reduce((acc, curr) => {
				return curr.shared_ids ? acc + curr.shared_ids.length : 0;
			}	, 0);
		}

		return selectedNodes.every((selectedNode) =>
			groupObjects.every((groupObject) => !isEqual(
					selectedNode.shared_ids && selectedNode.shared_ids.length ? selectedNode.shared_ids.sort() : [],
					groupObject.shared_ids && groupObject.shared_ids.length ? groupObject.shared_ids.sort() : []
				)
			)
		);
	}

	public handleFieldChange = (onChange, form) => (event) => {
		event.persist();
		const newValues = {
			...form.values,
			[event.target.name]: event.target.value
		};

		onChange(event);
		const isDirty = !isEqual(newValues, form.initialValues);
		this.props.setIsFormDirty(isDirty);
		form.validateForm(newValues)
			.then(() => {
				this.props.handleChange(event);
				this.props.setIsFormValid(true);
			})
			.catch(() => {
				this.props.setIsFormValid(false);
			});
	}

	public renderTypeSelectItems = () => {
		return GROUPS_TYPES_LIST.map(({ label, type }) => (
			<MenuItem key={type} value={type}>{label}</MenuItem>
		));
	}

	public render() {
		const { group: { updateDate, type, description, name, color, rules, totalSavedMeshes } } = this.props;
		const initialValues = { type, description, name, color, rules };

		return (
			<Formik
				initialValues={initialValues}
				validateOnBlur={false}
				validateOnChange={false}
				validationSchema={GroupSchema}
				onSubmit={this.props.onSubmit}
				ref={this.formikRef}
			>
				<Form>
					<FieldsRow>
						<StyledTextField
							label={<LongLabel>Number of objects</LongLabel>}
							value={totalSavedMeshes || 0}
							disabled
						/>
						<StyledTextField
							label="Last updated"
							value={dayjs(updateDate).format('HH:mm DD MMM')}
							disabled
						/>
						<StyledFormControl>
							<InputLabel>Group type</InputLabel>
							<Field name="type" render={({ field, form }) => (
								<Select
									{...field}
									disabled={!this.props.canUpdate}
									onChange={this.handleFieldChange(field.onChange, form)}
								>
									{this.renderTypeSelectItems()}
								</Select>
							)} />
						</StyledFormControl>
					</FieldsRow>
					<Field name="description" render={({ field, form }) => (
						<Description
							{...field}
							onChange={this.handleFieldChange(field.onChange, form)}
							validationSchema={GroupSchema}
							fullWidth
							multiline
							label="Description"
							error={Boolean(form.errors.description)}
							helperText={form.errors.description}
							disabled={!this.props.canUpdate}
						/>
					)} />
				</Form>
			</Formik>
		);
	}
}
