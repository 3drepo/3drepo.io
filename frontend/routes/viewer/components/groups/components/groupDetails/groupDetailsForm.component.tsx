import * as React from 'react';
import * as Yup from 'yup';
import * as dayjs from 'dayjs';

import { debounce, isEmpty } from 'lodash';
import { connect, Field, Form, withFormik } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import { TextField } from '../../../../../components/textField/textField.component';
import { VALIDATIONS_MESSAGES } from '../../../../../../services/validation';
import { FieldsRow, StyledFormControl, StyledTextField } from './groupDetails.styles';
import { SelectField } from '../../../../../components/selectField/selectField.component';
import { GROUPS_TYPES } from '../../../../../../constants/groups';
import { getGroupRGBAColor } from '../../../../../../helpers/colors';

const GroupSchema = Yup.object().shape({
	description: Yup.string().max(220, VALIDATIONS_MESSAGES.TOO_LONG_STRING)
});

interface IProps {
	group: any;
	values: any;
	formik: any;
	permissions: any;
	currentUser: any;
	newColor: string;
	onSubmit: (values) => void;
	onValueChange: (event) => void;
	handleChange: (event) => void;
	handleSubmit: () => void;
}

interface IState {
	isSaving: boolean;
}

class GroupDetailsFormComponent extends React.PureComponent<IProps, IState> {
	public formRef = React.createRef();

	public state = {
		isSaving: false
	};

	get isNewGroup() {
		return !this.props.group._id;
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;

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
		const { group: { updatedAt } } = this.props;
		return (
			<Form>
				<FieldsRow>
					<StyledTextField
						label="Number of objects"
						value={0}
						disabled
					/>
					<StyledTextField
						label="Last update"
						value={dayjs(updatedAt).format('DD MMM')}
						disabled
					/>
					<StyledFormControl>
						<InputLabel>Group type</InputLabel>
						<Field name="type" render={({ field }) => (
							<SelectField {...field}>
								<MenuItem key={'smart'} value={'smart'}>
									Criteria
								</MenuItem>
								<MenuItem key={'normal'} value={'normal'}>
									Normal
								</MenuItem>
							</SelectField>
						)} />
					</StyledFormControl>
				</FieldsRow>
				<Field name="description" render={({ field, form }) => (
					<TextField
						{...field}
						requiredConfirm={!this.isNewGroup}
						validationSchema={GroupSchema}
						fullWidth
						multiline
						label="Description"
					/>
				)} />
			</Form>
		);
	}
}

export const GroupDetailsForm = withFormik({
	mapPropsToValues: ({ group }) => ({
		description: group.description || '',
		type: group.rules.length ? GROUPS_TYPES.SMART : GROUPS_TYPES.NORMAL,
		color: getGroupRGBAColor(group.color)
	}),
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: GroupSchema
})(connect(GroupDetailsFormComponent as any)) as any;
