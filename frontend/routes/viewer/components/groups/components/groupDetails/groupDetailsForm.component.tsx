import * as React from 'react';
import * as Yup from 'yup';
import { debounce, isEmpty } from 'lodash';
import { connect, Field, Form, withFormik, Formik } from 'formik';

const GroupSchema = Yup.object().shape({});

interface IProps {
	group: any;
	values: any;
	formik: any;
	permissions: any;
	currentUser: any;
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
		const { group } = this.props;
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
		return (
			<Form>
				<div>Sample form</div>
			</Form>
		);
	}
}

export const GroupDetailsForm = withFormik({
	mapPropsToValues: ({ group }) => ({}),
	handleSubmit: (values, { props }) => {
		(props as IProps).onSubmit(values);
	},
	enableReinitialize: true,
	validationSchema: GroupSchema
})(connect(GroupDetailsFormComponent as any)) as any;
