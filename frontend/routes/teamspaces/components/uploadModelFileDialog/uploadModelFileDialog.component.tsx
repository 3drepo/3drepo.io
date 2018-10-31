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
import { Formik, Form, Field } from 'formik';

import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { Loader } from './../../../components/loader/loader.component';
import { acceptedFileFormats, unitsMap } from '../../../../constants/model-parameters';

import {
	ModelName,
	ModelInfo,
	HiddenFileInput,
	FileLabel,
	StyledDialogActions
} from './uploadModelFileDialog.styles';

interface IProps {
	uploadModelFile: (teamspace, modelId, fileData) => void;
	fetchModelSettings: (teamspace, modelId) => void;
	fetchRevisions: (teamspace, modelId) => void;
	handleClose: () => void;
	modelSettings: any;
	revisions: any[];
	modelId: string;
	modelName: string;
	teamspaceName: string;
}

interface IState {
	fileName: string;
}

export class UploadModelFileDialog extends React.PureComponent<IProps, IState> {
	public state = {
		fileName: ''
	};

	public inputFileRef = React.createRef<HTMLInputElement>();

	public componentDidMount() {
		const { modelId, teamspaceName, fetchModelSettings, fetchRevisions } = this.props;
		fetchRevisions(teamspaceName, modelId);
		fetchModelSettings(teamspaceName, modelId);
	}

	public handleFileUpload = (values) => {
		const { modelId, teamspaceName, handleClose, uploadModelFile } = this.props;

		const fileData = {
			file: this.inputFileRef.current.files[0],
			tag: values.revisionName,
			desc: values.revisionDesc
		};
		uploadModelFile(teamspaceName, modelId, fileData);
		handleClose();
	}

	public onInputChange = (event) => {
		this.setState({
			fileName: event.target.files[0].name
		});
	}

	public getAcceptedFormats = () => acceptedFileFormats.map((format) => `.${format}`).toString();

	public renderRevisionInfo = (revisions) => {
		const lastRevision = revisions[revisions.length - 1];
		const info = `Revision ${revisions.length}`;
		const formatedDate = dayjs(lastRevision.timestamp).format('DD MMM YYYY');

		if (lastRevision.tag) {
			return `${info}: ${ lastRevision.tag } - ${ formatedDate }`;
		}

		return `${info}: ${formatedDate}`;
	}

	public render() {
		const { modelSettings, revisions, modelName } = this.props;

		if (!modelSettings || !revisions.length ) {
			return <Loader />;
		}

		return (
			<Formik onSubmit={this.handleFileUpload} initialValues={{}}>
				<Form>
					<DialogContent>
						<ModelName>{modelName}</ModelName>
						<ModelInfo>
							{ revisions && this.renderRevisionInfo(revisions)	}
						</ModelInfo>
						<Field
							name="revisionName"
							render={({ field, form }) =>
								<TextField
									{...field}
									label="Name"
									margin="normal"
									fullWidth={true}
								/>
							}
								/>
						<Field
							name="revisionDesc"
							render={({ field, form }) =>
								<TextField
									{...field}
									label="Description"
									margin="normal"
									fullWidth={true}
								/>
							}
						/>

						{ modelSettings.properties &&
							<ModelInfo>
								{ `Model units: ${unitsMap[modelSettings.properties.unit]}` }
							</ModelInfo>
						}

						{ this.state.fileName && <ModelInfo>File name: { this.state.fileName } </ModelInfo> }

						<StyledDialogActions>
							<HiddenFileInput
								accept={this.getAcceptedFormats()}
								id="flat-button-file"
								type="file"
								innerRef={this.inputFileRef}
								onChange={this.onInputChange}
							/>
							<FileLabel htmlFor="flat-button-file">
								<Button component="span">Select</Button>
							</FileLabel>
							<Field render={({ form }) =>
								<Button
									type="submit"
									variant="raised"
									color="secondary"
									disabled={!this.state.fileName}>
										Upload
									</Button>}
								/>
						</StyledDialogActions>
					</DialogContent>
				</Form>
		</Formik>
		);
	}
}
