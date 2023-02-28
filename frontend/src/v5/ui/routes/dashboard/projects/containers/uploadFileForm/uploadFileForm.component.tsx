/**
 *  Copyright (C) 2021 3D Repo Ltd
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

import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { formatMessage } from '@/v5/services/intl';
import { RevisionsActionsDispatchers, FederationsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { Sidebar } from '@controls/sideBar';
import { IContainer, UploadFieldArray } from '@/v5/store/containers/containers.types';
import { filesizeTooLarge } from '@/v5/store/containers/containers.helpers';
import { UploadsSchema } from '@/v5/validation/containerAndFederationSchemes/containerSchemes';
import { DashboardListHeaderLabel } from '@components/dashboard/dashboardList';
import { FormattedMessage } from 'react-intl';
import { useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import {
	TeamspacesHooksSelectors,
	ProjectsHooksSelectors,
	RevisionsHooksSelectors,
	ContainersHooksSelectors,
	FederationsHooksSelectors,
} from '@/v5/services/selectorsHooks';
import { UploadList } from './uploadList';
import { SidebarForm } from './sidebarForm';
import { UploadsContainer, DropZone, Modal, UploadsListHeader, Padding, UploadsListScroll } from './uploadFileForm.styles';

type IUploadFileForm = {
	presetContainerId?: string;
	presetFile?: File;
	open: boolean;
	onClickClose: () => void;
};

interface AddFilesProps {
	files: File[];
	container?: IContainer;
}

type UploadModalLabelTypes = {
	isUploading: boolean;
	fileCount: number;
};

const uploadModalLabels = ({ isUploading, fileCount }: UploadModalLabelTypes) => (isUploading
	? {
		title: formatMessage({
			id: 'uploads.modal.title.uploading',
			defaultMessage: '{fileCount, plural, one {Uploading file} other {Uploading files}}',
		}, { fileCount }),
		subtitle: formatMessage({
			id: 'uploads.modal.subtitle.uploading',
			defaultMessage: '{fileCount, plural, one {Do not close this window until the upload is complete} other {Do not close this window until uploads are complete}}',
		}, { fileCount }),
		confirmLabel: formatMessage({ id: 'uploads.modal.buttonText.uploading', defaultMessage: 'Finished' }),
	}
	: {
		title: formatMessage({
			id: 'uploads.modal.title.preparing',
			defaultMessage: '{fileCount, plural, =0 {Add files for upload} one {Prepare file for upload} other {Prepare files for upload}}',
		}, { fileCount }),
		subtitle: formatMessage({
			id: 'uploads.modal.title.preparing',
			defaultMessage: '{fileCount, plural, =0 {Drag and drop or browse your computer} other {Select a file to add Container/Revision details}}',
		}, { fileCount }),
		confirmLabel: formatMessage({
			id: 'uploads.modal.buttonText.preparing',
			defaultMessage: '{fileCount, plural, one {Upload file} other {Upload files}}',
		}, { fileCount }),
	});

export const UploadFileForm = ({
	presetContainerId,
	presetFile,
	open,
	onClickClose,
}: IUploadFileForm): JSX.Element => {
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const project = ProjectsHooksSelectors.selectCurrentProject();

	const [selectedIndex, setSelectedIndex] = useState<number>(null);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const methods = useForm<UploadFieldArray>({
		mode: 'onBlur',
		resolver: yupResolver(UploadsSchema),
		context: { alreadyExistingNames: FederationsHooksSelectors.selectFederations().map(({ name }) => name) },
	});
	const {
		control,
		handleSubmit,
		formState: { isValid },
		trigger,
		getValues,
		setValue,
		watch,
	} = methods;
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'uploads',
		keyName: 'uploadId',
	});

	const [fileError, setFileError] = useState(false);
	useEffect(() => {
		setFileError(fields.some(({ file }) => filesizeTooLarge(file)));
	}, [fields.length]);

	const DEFAULT_SORT_CONFIG = {
		column: 'file',
		direction: SortingDirection.ASCENDING,
	};
	const { sortedList, setSortConfig }: any = useOrderedList(fields || [], DEFAULT_SORT_CONFIG);

	const revTagMaxValue = useMemo(() => {
		const schemaDescription = Yup.reach(UploadsSchema, 'uploads.revisionTag').describe();
		const revTagMax = schemaDescription.tests.find((t) => t.name === 'max');
		return revTagMax.params.max;
	}, []);

	const parseFilename = (filename: string): string => {
		const baseName = filename.split('.').slice(0)[0];
		const noSpecialChars = baseName.replace(/[^a-zA-Z0-9_\- ]/g, '');
		const noSpaces = noSpecialChars.replace(/ /g, '_');
		const noExceedingMax = noSpaces.substring(0, revTagMaxValue);
		return noExceedingMax;
	};

	const extensionIsSpm = (extension: string) => extension === 'spm';

	const addFilesToList = ({ files, container }: AddFilesProps): void => {
		const filesToAppend = [];
		for (const file of files) {
			const extension = file.name.split('.').slice(-1)[0].toLocaleLowerCase();
			filesToAppend.push({
				file,
				progress: 0,
				extension,
				revisionTag: parseFilename(file.name),
				containerName: container?.name || '',
				containerId: container?._id || '',
				containerUnit: container?.unit || 'mm',
				containerType: container?.type || 'Uncategorised',
				containerCode: container?.code || '',
				containerDesc: container?.desc || '',
				revisionDesc: '',
				importAnimations: extensionIsSpm(extension),
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
			});
		}
		append(filesToAppend);
	};

	const presetContainer = ContainersHooksSelectors.selectContainerById(presetContainerId);
	useEffect(() => {
		if (presetFile) addFilesToList({ files: [presetFile], container: presetContainer });
		FederationsActionsDispatchers.fetchFederations(teamspace, project);
	}, []);

	const sidebarOpen = Number.isInteger(selectedIndex) && !isUploading;

	const indexMap = new Map(fields.map(({ uploadId }, index) => [uploadId, index]));
	const getOriginalIndex = (sortedIndex) => indexMap.get(sortedList[sortedIndex].uploadId);
	const origIndex = sidebarOpen && getOriginalIndex(selectedIndex);

	const onClickEdit = (id: number) => setSelectedIndex(id);

	const onClickDelete = (id: number) => {
		if (id < selectedIndex) setSelectedIndex(selectedIndex - 1);
		if (id === selectedIndex) setSelectedIndex(null);
		remove(getOriginalIndex(id));
	};

	const onSubmit = async ({ uploads }: UploadFieldArray) => {
		if (isUploading) {
			setIsUploading(false);
			onClickClose();
		} else {
			setIsUploading(true);
			setSelectedIndex(null);
			uploads.forEach((revision, index) => {
				const { uploadId } = fields[index];
				RevisionsActionsDispatchers.createRevision(teamspace, project, uploadId, revision);
			});
		}
	};

	const allUploadsComplete = RevisionsHooksSelectors.selectUploadIsComplete();

	return (
		<FormProvider {...methods}>
			<Modal
				open={open}
				onSubmit={handleSubmit(onSubmit)}
				onClickClose={onClickClose}
				onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
				maxWidth="xl"
				isValid={(isValid && !fileError && !isUploading) || (isUploading && allUploadsComplete)}
				{...uploadModalLabels({ isUploading, fileCount: fields.length })}
			>
				<UploadsContainer>
					<UploadsListScroll>
						<Padding>
							{!!fields.length && (
								<>
									<UploadsListHeader
										onSortingChange={setSortConfig}
										defaultSortConfig={DEFAULT_SORT_CONFIG}
									>
										<DashboardListHeaderLabel key="file" name="file.name" minWidth={122}>
											<FormattedMessage id="uploads.list.header.filename" defaultMessage="Filename" />
										</DashboardListHeaderLabel>
										<DashboardListHeaderLabel key="destination" width={352}>
											<FormattedMessage id="uploads.list.header.destination" defaultMessage="Destination" />
										</DashboardListHeaderLabel>
										<DashboardListHeaderLabel key="revisionName" width={isUploading ? 359 : 399}>
											<FormattedMessage id="uploads.list.header.revisionName" defaultMessage="Revision Name" />
										</DashboardListHeaderLabel>
										<DashboardListHeaderLabel key="progress" width={297} hidden={!isUploading}>
											<FormattedMessage id="uploads.list.header.progress" defaultMessage="Upload Progress" />
										</DashboardListHeaderLabel>
									</UploadsListHeader>
									<UploadList
										values={sortedList}
										selectedIndex={selectedIndex}
										isUploading={isUploading}
										onClickEdit={(id) => onClickEdit(id)}
										onClickDelete={(id) => onClickDelete(id)}
										getOriginalIndex={getOriginalIndex}
									/>
								</>
							)}
							<DropZone
								message={formatMessage(
									{ id: 'uploads.dropzone.message', defaultMessage: 'Supported file formats: IFC, RVT, DGN, FBX, OBJ and <MoreLink>more</MoreLink>' },
									{ MoreLink:
										(child: string) => (
											<a href="https://help.3drepo.io/en/articles/4798885-supported-file-formats" target="_blank" rel="noreferrer">{child}</a>
										),
									},
								)}
								processFiles={(files) => addFilesToList({ files })}
								hidden={isUploading}
							/>
						</Padding>
					</UploadsListScroll>
					<Sidebar
						open={sidebarOpen}
						onClick={() => setSelectedIndex(null)}
					>
						{
							sidebarOpen
								? (
									<span key={watch(`uploads.${origIndex}.containerName`)}>
										<SidebarForm
											value={getValues(`uploads.${origIndex}`)}
											key={sortedList[selectedIndex].uploadId}
											isNewContainer={
												!getValues(`uploads.${origIndex}.containerId`)
												&& !!getValues(`uploads.${origIndex}.containerName`)
											}
											isSpm={extensionIsSpm(sortedList[origIndex].extension)}
											onChange={(field: string, val: string | boolean) => {
												// @ts-ignore
												setValue(`uploads.${origIndex}.${field}`, val);
												// @ts-ignore
												trigger(`uploads.${origIndex}.${field}`);
											}}
										/>
									</span>
								)
								: <></>
						}
					</Sidebar>
				</UploadsContainer>
			</Modal>
		</FormProvider>
	);
};
