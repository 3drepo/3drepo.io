/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { formatMessage } from '@/v5/services/intl';
import { UploadsSchema } from '@/v5/validation/drawingSchemes/drawingSchemes';
import {
	TeamspacesHooksSelectors,
	ProjectsHooksSelectors,
	DrawingRevisionsHooksSelectors,
	DrawingsHooksSelectors,
} from '@/v5/services/selectorsHooks';
import { getSupportedDrawingRevisionsFileExtensions } from '@controls/fileUploader/uploadFile';
import { UploadFiles } from '@components/shared/uploadFiles/uploadFiles.component';
import { UploadFieldArray, UploadFilesContextComponent } from '@components/shared/uploadFiles/uploadFilesContext';
import { SidebarForm } from './sidebarForm/sidebarForm.component';
import { IDrawing } from '@/v5/store/drawings/drawings.types';
import { DrawingRevisionsActionsDispatchers, DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { UploadList } from './uploadList/uploadList.component';
import { parseFileName, reduceFileData, isPdf, getPdfFirstPage, fileToPdf, pdfToFile } from '@components/shared/uploadFiles/uploadFiles.helpers';
import { UploadItemFields } from '@/v5/store/drawings/revisions/drawingRevisions.types';

type UploadModalLabelTypes = {
	isUploading: boolean;
	fileCount: number;
};
type FormType = UploadFieldArray<UploadItemFields>;

const uploadModalLabels = ({ isUploading, fileCount }: UploadModalLabelTypes) => (isUploading
	? {
		title: formatMessage({
			id: 'drawing.uploads.modal.title.uploading',
			defaultMessage: '{fileCount, plural, one {Uploading file} other {Uploading files}}',
		}, { fileCount }),
		subtitle: formatMessage({
			id: 'drawing.uploads.modal.subtitle.uploading',
			defaultMessage: '{fileCount, plural, one {Do not close this window until the upload is complete} other {Do not close this window until uploads are complete}}',
		}, { fileCount }),
		confirmLabel: formatMessage({ id: 'drawing.uploads.modal.buttonText.uploading', defaultMessage: 'Finished' }),
	}
	: {
		title: formatMessage({
			id: 'drawing.uploads.modal.title.preparing',
			defaultMessage: '{fileCount, plural, =0 {Add files for upload} one {Prepare file for upload} other {Prepare files for upload}}',
		}, { fileCount }),
		subtitle: formatMessage({
			id: 'drawing.uploads.modal.title.preparing',
			defaultMessage: '{fileCount, plural, =0 {Drag and drop or browse your computer} other {Select a file to add Drawing/Revision details}}',
		}, { fileCount }),
		confirmLabel: formatMessage({
			id: 'drawing.uploads.modal.buttonText.preparing',
			defaultMessage: '{fileCount, plural, one {Upload file} other {Upload files}}',
		}, { fileCount }),
	});

type IUploadDrawingRevisionForm = {
	presetDrawingId?: string;
	presetFile?: File;
	open: boolean;
	onClickClose: () => void;
};

export const UploadDrawingRevisionForm = ({
	presetDrawingId,
	presetFile,
	open,
	onClickClose,
}: IUploadDrawingRevisionForm): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();
	const allUploadsComplete = DrawingRevisionsHooksSelectors.selectUploadIsComplete();
	const presetDrawing = DrawingsHooksSelectors.selectDrawingById(presetDrawingId);

	const [isUploading, setIsUploading] = useState<boolean>(false);

	const formData = useForm<FormType>({
		mode: 'onChange',
		resolver: !isUploading ? yupResolver(UploadsSchema) : undefined,
		context: {
			alreadyExistingNames: [],
			teamspace,
			project,
		},
	});

	const {
		control,
		handleSubmit,
		formState: { isValid },
	} = formData;
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'uploads',
		keyName: 'uploadId',
	});

	const revisionNameMaxLength = useMemo(() => {
		const schemaDescription =  Yup.reach(UploadsSchema, 'uploads.revisionName').describe();
		const revisionNameMax = schemaDescription.tests.find((t) => t.name === 'max');
		return revisionNameMax.params.max;
	}, []);

	const addFilesToList = async (files: File[], drawing?: IDrawing) => {
		const filesToAppend = [];
		for (let fileAsGeneric of files) {
			const fileName = fileAsGeneric.name;
			const fileData = {
				file: fileAsGeneric,
				isMultiPagePdf: false,
			};
			if (isPdf(fileAsGeneric)) {
				try {
					const fileAsPdf = await fileToPdf(fileAsGeneric);
					const pageCount = fileAsPdf.getPageCount();
					if (pageCount > 1) {
						fileData.isMultiPagePdf = true;
						const pdfSinglePage = await getPdfFirstPage(fileAsPdf);
						fileData.file = await pdfToFile(pdfSinglePage, fileName);
					}
				} catch (e) { /** let backend catch corrupted PDFs */}
			}
			filesToAppend.push({
				...fileData,
				progress: 0,
				extension: fileName.split('.').slice(-1)[0].toLocaleLowerCase(),
				revisionName: parseFileName(fileName, revisionNameMaxLength),
				statusCode: '',
				revisionCode: '',
				revisionDesc: '',
				drawingId: drawing?._id || '',
				drawingName: drawing?.name?.trim() || '',
				drawingNumber: drawing?.number || '',
				drawingDesc: drawing?.desc || '',
				drawingCategory: drawing?.category || '',
			});
		}
		append(filesToAppend);
	};

	const removeUploadById = useCallback((uploadId) => {
		remove(fields.findIndex((field) => field.uploadId === uploadId));
	}, [fields.length]);

	const onSubmit = useCallback(handleSubmit(async ({ uploads }) => {
		if (isUploading) {
			setIsUploading(false);
			onClickClose();
		} else {
			setIsUploading(true);
			uploads.forEach((revision, index) => {
				const { uploadId } = fields[index];
				DrawingRevisionsActionsDispatchers.createRevision(teamspace, project, uploadId, revision);
			});
		}
	}), [fields.length]);

	const supportedFilesMessage = formatMessage({
		id: 'drawing.uploads.dropzone.message',
		defaultMessage: 'Supported file formats: PDF and DWG{br}Note: AutoCalibration is only possible with DWG formats.',
	}, { br: <br /> });

	useEffect(() => {
		if (presetFile) {
			addFilesToList([presetFile], presetDrawing);
		}
		DrawingsActionsDispatchers.fetchCategories(teamspace, project);
	}, []);

	return (
		<FormProvider {...formData}>
			{/* @ts-ignore */}
			<UploadFilesContextComponent fields={fields}>
				<UploadFiles
					open={open}
					onClickClose={onClickClose}
					onUploadFiles={addFilesToList}
					onSubmit={onSubmit}
					SideBarComponent={SidebarForm}
					supportedFilesMessage={supportedFilesMessage}
					isUploading={isUploading}
					setIsUploading={setIsUploading}
					modalLabels={uploadModalLabels({ isUploading, fileCount: fields.length })}
					fields={fields}
					isValid={!isUploading ? isValid : allUploadsComplete}
					supportedFileExtensions={getSupportedDrawingRevisionsFileExtensions()}
				>
					<UploadList
						values={reduceFileData(fields)}
						isUploading={isUploading}
						removeUploadById={removeUploadById}
					/>
				</UploadFiles>
			</UploadFilesContextComponent>
		</FormProvider>
	);
};
