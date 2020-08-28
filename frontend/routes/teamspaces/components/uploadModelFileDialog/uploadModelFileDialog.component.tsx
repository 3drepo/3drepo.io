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

import { Field, Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import Button from '@material-ui/core/Button';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import {
	LoadingDialog
} from '../../../components/dialogContainer/components';

import { unitsMap } from '../../../../constants/model-parameters';
import { schema } from '../../../../services/validation';
import { FileInputField } from './components/fileInputField.component';

import { formatNamedMonthDate } from '../../../../services/formatting/formatDate';
import {
	Additional,
	CancelButton,
	Main,
	ModelInfo,
	ModelName,
	StyledDialogActions,
} from './uploadModelFileDialog.styles';

const UploadSchema = Yup.object().shape({
	revisionName: schema.revisionName,
	file: Yup.mixed().required()
});

interface IProps {
	uploadModelFile: (teamspace, projectName, modelData, fileData, handleClose) => void;
	fetchModelSettings: (teamspace, modelId) => void;
	fetchRevisions: (teamspace, modelId, showVoid) => void;
	handleClose: () => void;
	handleDisableClose: (set: boolean) => void;
	disableClosed: boolean;
	modelSettings: any;
	revisions: any[];
	models: any[];
	modelId: string;
	modelName: string;
	teamspaceName: string;
	projectName: string;
	isPending: boolean;
	isModelUploading: boolean;
}

interface IState {
	fileName: string;
}

export class UploadModelFileDialog extends React.PureComponent<IProps, IState> {
	public state = {
		fileName: ''
	};

	get modelDetails() {
		return this.props.models[this.props.modelSettings.id] || null;
	}

	get modelStatus() {
		return this.modelDetails && this.modelDetails.status;
	}

	get isModelUploading() {
		return this.props.isModelUploading;
	}

	public componentDidMount() {
		const { modelId, teamspaceName, fetchModelSettings, fetchRevisions } = this.props;
		fetchRevisions(teamspaceName, modelId, true);
		fetchModelSettings(teamspaceName, modelId);
	}

	public componentDidUpdate(prevProps: Readonly<IProps>) {
		if (this.isModelUploading && !this.props.disableClosed) {
			this.props.handleDisableClose(true);
		}

		if (!this.isModelUploading && this.props.disableClosed) {
			this.props.handleDisableClose(false);
		}
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

		uploadModelFile(teamspaceName, projectName, modelData, fileData, handleClose);
	}

	public renderRevisionInfo = (revisions) => {
		if (!revisions.length) {
			return `No revisions yet.`;
		}
		const lastRevision = revisions[0];
		const info = `#Revisions: ${revisions.length}`;
		const formatedDate = formatNamedMonthDate(lastRevision.timestamp);

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
		const { modelSettings, revisions, modelName, models, handleClose, isPending } = this.props;

		if (isPending) {
			return <LoadingDialog content={`Loading ${modelName} data...`} />;
		}

		if (this.isModelUploading) {
			return (
				<LoadingDialog>
					<Main>{`Uploading ${modelName} model...`}</Main>
					<Additional>{'Please do not leave this page before upload has finished'}</Additional>
				</LoadingDialog>
			);
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
									fullWidth
								/>}
								/>
						<Field
							name="revisionDesc"
							render={ ({ field }) =>
								<TextField
									{...field}
									label="Description"
									margin="normal"
									fullWidth
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
								/>
							} />
							<Field render={ () =>
								<CancelButton
									onClick={handleClose}
									color="secondary"
								>
									Cancel
								</CancelButton>
							} />
							<Field render={ ({ form }) =>
								<Button
									type="submit"
									variant="raised"
									color="secondary"
									disabled={(!form.isValid || form.isValidating)}
								>
									Upload
								</Button>
							} />
						</StyledDialogActions>
					</DialogContent>
				</Form>
		</Formik>
		);
	}
}
