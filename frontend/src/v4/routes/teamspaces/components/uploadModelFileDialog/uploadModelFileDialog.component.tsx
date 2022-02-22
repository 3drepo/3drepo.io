/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { snakeCase } from 'lodash';
import { PureComponent } from 'react';
import * as Yup from 'yup';
import * as countriesAndTimezones from 'countries-and-timezones';
import Button from '@material-ui/core/Button';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import FileIcon from '@material-ui/icons/InsertDriveFileOutlined';
import Checkbox from '@material-ui/core/Checkbox';
import InputLabel from '@material-ui/core/InputLabel';
import { CellSelect } from '../../../components/customTable/components/cellSelect/cellSelect.component';

import { unitsMap } from '../../../../constants/model-parameters';
import { schema } from '../../../../services/validation';
import { LoadingDialog } from '../../../components/dialogContainer/components';
import { renderWhenTrue, renderWhenTrueOtherwise} from '../../../../helpers/rendering';
import { formatNamedMonthDate } from '../../../../services/formatting/formatDate';
import { FileInputField } from './components/fileInputField.component';
import {
	Additional,
	CancelButton,
	CheckboxContainer,
	FileContainer,
	FileName,
	FormControl,
	Main,
	ModelInfo,
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
	values: any;
	isModelUploading: boolean;
}

interface IState {
	fileName: string;
	allowImportAnimations: boolean;
	allowSetTimezone: boolean;
}


const generateTimezoneData = () => {
	let defaultTimezone;
	const timezoneList  = [];
	const labelToTZName = {};
	const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	const tzData = countriesAndTimezones.getAllTimezones();
	for (const tz in tzData) {
		const {name, utcOffset, utcOffsetStr} = tzData[tz];
		const tzToAdd = {
			name,
			label: `(UTC${utcOffsetStr}) ${name}`,
			utcOffset
		};

		if (name === browserTimezone ||
			(!defaultTimezone && name === 'Etc/UTC')) {
			defaultTimezone = tzToAdd;
		}
		timezoneList.push(tzToAdd);

		labelToTZName[tzToAdd.label] = tzToAdd.name;
	}

	const allTimezones = timezoneList.sort((tz1, tz2) => tz1.utcOffset - tz2.utcOffset);
	return { defaultTimezone, allTimezones, labelToTZName };
};

const { allTimezones, defaultTimezone, labelToTZName } = generateTimezoneData();

export class UploadModelFileDialog extends PureComponent<IProps, IState> {
	public state = {
		fileName: '',
		allowImportAnimations: false,
		allowSetTimezone: false,
		timezones: [],
		selectedTimezone: {name: '', label: ''}
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

		const fileData: any = {
			file: values.file,
			tag: values.revisionName,
			desc: values.revisionDesc,
		};

		if (this.state.allowSetTimezone) {
			fileData.timezone =  values.selectedTimezone;
		}

		if (this.state.allowImportAnimations) {
			fileData.importAnimations = values.importAnimations;
		}

		const modelData = {
			modelName, modelId
		};

		uploadModelFile(teamspaceName, projectName, modelData, fileData, handleClose);
	}

	public onTimezoneChanged = (newTimezone, { value, setFieldValue}) => {
		setFieldValue('selectedTimezone', labelToTZName[newTimezone]);
	}

	public renderRevisionsInfo = renderWhenTrueOtherwise(() => (
		<ModelInfo>
			{`Number of Revisions: ${this.props.revisions.length}`}
		</ModelInfo>
	), () => (
		<ModelInfo>
			No revisions yet.
		</ModelInfo>
	));

	public renderLastRevisionInfo = renderWhenTrue(() => {
		const lastRevision = this.props.revisions[0];
		const formattedDate = formatNamedMonthDate(lastRevision.timestamp);
		const lastRevisionTag = `${lastRevision.tag} ` || '';

		return (
			<ModelInfo>
				{`Last Revision: ${lastRevisionTag}(Uploaded on ${formattedDate})`}
			</ModelInfo>
		);
	});

	public renderModelUnits = renderWhenTrue(() => (
		<ModelInfo>
			{`Model Units: ${unitsMap[this.props.modelSettings.properties.unit]}`}
		</ModelInfo>
	));

	public renderImportTransformations = renderWhenTrue(() => (
		<Field name="importAnimations" render={({ field }) => (
			<CheckboxContainer
				control={
					<Checkbox
						checked={field.value}
						{...field}
						color="secondary"
					/>
				}
				label="Import transformations"
			/>
		)} />
	));

	public renderTimezones = renderWhenTrue(() => (
		<Field name="selectedTimezone" render={({ field, form }) => (
			<FormControl margin="normal">
				<InputLabel shrink htmlFor="timezone-select">Project Timezone</InputLabel>
					<CellSelect
						{...field}
						items={allTimezones.map((tz) => tz.label)}
						value={defaultTimezone.label}
						onChange={ (event, data) => this.onTimezoneChanged(data, form) }
						disabledPlaceholder
						inputId="timezone-select"
					/>
			</FormControl>
		)} />
	));

	public renderFileName = renderWhenTrue(() => (
		<FileName><FileIcon />{this.state.fileName}</FileName>
	));

	public handleFileChange = (onChange, { values, setFieldValue }) => (event, ...params) => {
		const fileName = event.target.value.name;
		this.setState({
			fileName,
		});

		const extension = fileName.split('.').pop();

		if (extension === 'spm') {
			this.setState({
				allowImportAnimations: true,
				allowSetTimezone: true
			}, () => setFieldValue('importAnimations', true));
		} else {
			this.setState({
				allowImportAnimations: false,
				allowSetTimezone: false
			}, () => setFieldValue('importAnimations', false));
		}

		if (!values.revisionName) {
			setFieldValue('revisionName', snakeCase(fileName.replace(extension, '').substring(0, 50)));
		}

		onChange(event, ...params);
	}

	public render() {
		const { modelSettings, revisions, modelName, handleClose, isPending } = this.props;

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
				initialValues={{ revisionName: '', revisionDesc: '', file: '', importAnimations: false, selectedTimezone: defaultTimezone.name }}
				enableReinitialize
				validationSchema={UploadSchema}
			>
				<Form>
					<DialogContent>
						{this.renderRevisionsInfo(!!revisions.length)}
						{this.renderLastRevisionInfo(!!revisions.length)}
						{this.renderModelUnits(!!modelSettings.properties)}
						<FileContainer>
							{this.renderFileName(!!this.state.fileName)}
							<Field name="file" render={({ field, form }) =>
								<FileInputField
									{...field}
									onChange={this.handleFileChange(field.onChange, form)}
									update={!!this.state.fileName}
								/>
							} />
						</FileContainer>
						{this.renderImportTransformations(this.state.allowImportAnimations)}
						<Field
							name="revisionName"
							render={ ({ field, form }) =>
								<TextField
									{...field}
									error={Boolean(form.errors.revisionName)}
									helperText={form.errors.revisionName}
									label="Revision Name"
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
						{this.renderTimezones(this.state.allowSetTimezone)}
						<StyledDialogActions>
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
									variant="contained"
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
