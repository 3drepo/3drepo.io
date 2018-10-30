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
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { Loader } from './../../../components/loader/loader.component';
import { unitsMap } from './../../../modelSettings/modelSettings.component';

import { ModelName, ModelInfo, HiddenFileInput, FileLabel } from './uploadModelFileDialog.styles';

const acceptedFormat = [
	"x", "obj", "3ds", "md3", "md2", "ply",
	"mdl", "ase", "hmp", "smd", "mdc", "md5",
	"stl", "lxo", "nff", "raw", "off", "ac",
	"bvh", "irrmesh", "irr", "q3d", "q3s", "b3d",
	"dae", "ter", "csm", "3d", "lws", "xml", "ogex",
	"ms3d", "cob", "scn", "blend", "pk3", "ndo",
	"ifc", "xgl", "zgl", "fbx", "assbin", "bim", "dgn"
];

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
	file: string;
}

export class UploadModelFileDialog extends React.PureComponent<IProps, IState> {
	public state = {
		file: ''
	};

	public inputFileRef = React.createRef<HTMLElement>();

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
			file: this.inputFileRef.current.files[0].name
		});
	}

	public getAcceptedFormats = () => acceptedFormat.map((format) => `.${format}`).toString();

	public renderRevisionInfo = (revisions) => {
		const lastRevision = revisions[revisions.length - 1];
		let info = `Revision ${revisions.length}:`;

		if (lastRevision.tag) {
			info += ` ${lastRevision.tag} - ${dayjs(lastRevision.timestamp).format('DD MMM YYYY')}`;
		} else {
			info += ` ${dayjs(lastRevision.timestamp).format('DD MMM YYYY')}`;
		}

		return info;
	}

	public render() {
		const { modelSettings, revisions, modelName } = this.props;

		if (!modelSettings || !revisions.length ) {
			return <Loader />;
		}

		return (
			<Formik onSubmit={this.handleFileUpload}>
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
									required
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

						{ this.state.file && <ModelInfo> { this.state.file } </ModelInfo> }

						<DialogActions>
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
									disabled={!form.isValid || form.isValidating || !this.inputFileRef.current.files.length}>
										Upload
									</Button>}
								/>
						</DialogActions>
					</DialogContent>
				</Form>
		</Formik>
		);
	}
}
