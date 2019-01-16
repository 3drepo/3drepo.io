import * as React from 'react';
import * as Yup from 'yup';
import { pick, get } from 'lodash';
import { Formik, Field, Form, withFormik } from 'formik';
import InputLabel from '@material-ui/core/InputLabel';

import { CellSelect } from '../../../../../components/customTable/components/cellSelect/cellSelect.component';

interface IProps {
}

class IssueDetailsFormComponent extends React.PureComponent<IProps, any> {
	public render() {
		return (
			(<div>Form</div>)
		);
	}
}

export const IssueDetailsForm = withFormik({
	mapPropsToValues: ({ issue }) => {
		return {};
	},
	handleSubmit: () => {}
})(IssueDetailsFormComponent as any) as any;
