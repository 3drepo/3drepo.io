/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import * as dayjs from 'dayjs';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';

import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import {
	LoadingDialog
} from './../../../../routes/components/dialogContainer/components/loadingDialog/loadingDialog.component';

import { schema } from '../../../../services/validation';
import { FileInputField } from './components/fileInputField.component';
import { unitsMap } from '../../../../constants/model-parameters';

import { ModelName, ModelInfo, StyledDialogActions, CancelButton } from './uploadModelFileDialog.styles';

const UploadSchema = Yup.object().shape({
	revisionName: schema.revisionName,
	file: Yup.mixed().required()
});

interface IProps {
	uploadModelFile: (teamspace, projectName, modelData, fileData) => void;
	fetchModelSettings: (teamspace, modelId) => void;
	fetchRevisions: (teamspace, modelId) => void;
	handleClose: () => void;
	modelSettings: any;
	revisions: any[];
	modelId: string;
	modelName: string;
	teamspaceName: string;
	projectName: string;
	isPending: boolean;
}

interface IState {
	fileName: string;
}

export class UploadModelFileDialog extends React.PureComponent<IProps, IState> {
	public state = {
		fileName: ''
	};

	public componentDidMount() {
		const { modelId, teamspaceName, fetchModelSettings, fetchRevisions } = this.props;
		fetchRevisions(teamspaceName, modelId);
		fetchModelSettings(teamspaceName, modelId);
	}

	public handleFileUpload = (values) => {
		const { modelId, teamspaceName, projectName, handleClose, uploadModelFile, modelName } = this.props;

		const fileData = {
			file: values.file,
			tag: values.revisionName,
			desc: values.revisionDesc
		};

		const modelData = {
			modelName, modelId
		};

		uploadModelFile(teamspaceName, projectName, modelData, fileData);
		handleClose();
	}

	public renderRevisionInfo = (revisions) => {
		if (!revisions.length) {
			return `No revisions yet.`;
		}
		const lastRevision = revisions[0];
		const info = `#Revisions: ${revisions.length}`;
		const formatedDate = dayjs(lastRevision.timestamp).format('DD MMM YYYY');

		if (lastRevision.tag) {
			return `${info}, Most Recent: ${ lastRevision.tag } - ${ formatedDate }`;
		}

		return `${info}, Most Recent: ${formatedDate}`;
	}

	public handleFileChange = (onChange) => (event, ...params) => {
		this.setState({
			fileName: event.target.value.name
		});

		onChange(event, ...params);
	}

	public render() {
		const { modelSettings, revisions, modelName, handleClose, isPending } = this.props;

		if (isPending) {
			return <LoadingDialog content={`Loading ${modelName} data...`} />;
		}

		return (
			<Formik
				onSubmit={this.handleFileUpload}
				initialValues={{ revisionName: '', revisionDesc: '', file: '' }}
				validationSchema={UploadSchema}
			>
				<Form>
					<DialogContent>
						<ModelName>{modelName}</ModelName>
						<ModelInfo> {this.renderRevisionInfo(revisions)} </ModelInfo>
						<Field
							name="revisionName"
							render={ ({ field, form }) =>
								<TextField
									{...field}
									error={Boolean(form.errors.revisionName)}
									helperText={form.errors.revisionName}
									label="Name"
									margin="normal"
									fullWidth={true}
								/>}
								/>
						<Field
							name="revisionDesc"
							render={ ({ field }) =>
								<TextField
									{...field}
									label="Description"
									margin="normal"
									fullWidth={true}
								/>}
						/>
						{ modelSettings.properties &&
							<ModelInfo>
								{`Model units: ${unitsMap[modelSettings.properties.unit]}`}
							</ModelInfo>
						}
						{this.state.fileName && <ModelInfo>File name: {this.state.fileName} </ModelInfo>}
						<StyledDialogActions>
							<Field name="file" render={({ field }) =>
								<FileInputField
									{...field}
									onChange={this.handleFileChange(field.onChange)}
						/>} />
							<Field render={ () =>
								<CancelButton
									onClick={handleClose}
									color="secondary">
									Cancel
									</CancelButton> }
							/>
							<Field render={ ({ form }) =>
								<Button
									type="submit"
									variant="raised"
									color="secondary"
									disabled={(!form.isValid || form.isValidating)}>
										Upload
									</Button>}	/>
						</StyledDialogActions>
					</DialogContent>
				</Form>
		</Formik>
		);
	}
}
