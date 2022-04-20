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
import { useParams } from 'react-router';

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { formatMessage } from '@/v5/services/intl';
import { RevisionsActionsDispatchers } from '@/v5/services/actionsDispatchers/revisionsActions.dispatchers';
import { Sidebar } from '@controls/sideBar';
import { ScrollArea } from '@controls/scrollArea';
import { UploadFieldArray } from '@/v5/store/containers/containers.types';
import { filesizeTooLarge, UploadsSchema } from '@/v5/validation/containers';
import { DashboardListHeaderLabel } from '@components/dashboard/dashboardList';
import { FormattedMessage } from 'react-intl';
import { useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { RevisionsHooksSelectors } from '@/v5/services/selectorsHooks/revisionsSelectors.hooks';
import { isEmpty } from 'lodash';
import { UploadList } from './uploadList';
import { SidebarForm } from './sidebarForm';
import { Container, DropZone, Modal, UploadsListHeader, Padding } from './uploadFileForm.styles';

type IUploadFileForm = {
	openState: boolean;
	onClickClose: () => void;
};

export const UploadFileForm = ({ openState, onClickClose }: IUploadFileForm): JSX.Element => {
	const { teamspace, project } = useParams() as { teamspace: string, project: string };

	const [selectedIndex, setSelectedIndex] = useState<number>(null);
	const [isUploading, setIsUploading] = useState<boolean>(false);
	const methods = useForm<UploadFieldArray>({
		mode: 'onBlur',
		resolver: yupResolver(UploadsSchema),
	});
	const { control,
		handleSubmit,
		formState: { errors, isValid },
		trigger,
		getValues,
		setValue,
		watch,
		reset,
		setError,
		clearErrors,
	} = methods;
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'uploads',
		keyName: 'uploadId',
	});

	useEffect(() => {
		if (!isUploading) reset();
	}, [isUploading]);

	useEffect(() => {
		if (fields.some((field) => filesizeTooLarge(field.file))) {
			setError('uploads', { type: 'custom', message: '' });
		} else {
			clearErrors('uploads');
		}
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

	const processFiles = (files: File[]): void => {
		const filesToAppend = [];
		for (const file of files) {
			filesToAppend.push({
				file,
				progress: 0,
				extension: file.name.split('.').slice(-1)[0],
				revisionTag: parseFilename(file.name),
				containerName: '',
				containerId: '',
				containerUnit: 'mm',
				containerType: 'Uncategorised',
				containerCode: '',
				containerDesc: '',
				revisionDesc: '',
				importAnimations: false,
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
			});
		}
		append(filesToAppend);
	};

	const indexMap = new Map(fields.map(({ uploadId }, index) => [uploadId, index]));
	const getOriginalIndex = (sortedIndex) => indexMap.get(sortedList[sortedIndex].uploadId);
	const origIndex = Number.isInteger(selectedIndex) && getOriginalIndex(selectedIndex);

	const onClickEdit = (id: number) => {
		setSelectedIndex(id);
	};

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
				open={openState}
				onSubmit={handleSubmit(onSubmit)}
				onClickClose={onClickClose}
				confirmLabel={
					isUploading
						? formatMessage({ id: 'uploads.modal.buttonText.uploading', defaultMessage: 'Finished' })
						: formatMessage({ id: 'uploads.modal.buttonText.preparing', defaultMessage: 'Upload files' })
				}
				title={
					isUploading
						? formatMessage({ id: 'uploads.modal.title.uploading', defaultMessage: 'Uploading files' })
						: formatMessage({ id: 'uploads.modal.title.preparing', defaultMessage: 'Prepare files for upload' })
				}
				subtitle={
					isUploading
						? formatMessage({ id: 'uploads.modal.subtitle.uploading', defaultMessage: 'Do not close this window until uploads are complete' })
						: formatMessage({ id: 'uploads.modal.subtitle.preparing', defaultMessage: 'Select a file to add Container/Revision details' })
				}
				onKeyPress={(e) => e.key === 'Enter' && e.preventDefault()}
				maxWidth="xl"
				isValid={(isValid && isEmpty(errors) && !isUploading) || (isUploading && allUploadsComplete)}
			>
				<Container>
					<ScrollArea>
						<Padding>
							<div hidden={!fields.length}>
								<UploadsListHeader
									onSortingChange={setSortConfig}
									defaultSortConfig={DEFAULT_SORT_CONFIG}
								>
									<DashboardListHeaderLabel key="file" name="file.name">
										<FormattedMessage id="uploads.list.header.filename" defaultMessage="Filename" />
									</DashboardListHeaderLabel>
									<DashboardListHeaderLabel key="destination" width={282}>
										<FormattedMessage id="uploads.list.header.destination" defaultMessage="Destination" />
									</DashboardListHeaderLabel>
									<DashboardListHeaderLabel key="revisionName" width={isUploading ? 282 : 302}>
										<FormattedMessage id="uploads.list.header.revisionName" defaultMessage="Revision Name" />
									</DashboardListHeaderLabel>
									<DashboardListHeaderLabel key="progress" width={337} hidden={!isUploading}>
										<FormattedMessage id="uploads.list.header.progress" defaultMessage="Upload Progress" />
									</DashboardListHeaderLabel>
								</UploadsListHeader>
							</div>
							{!!fields.length && (
								<UploadList
									values={sortedList}
									selectedIndex={selectedIndex}
									isUploading={isUploading}
									onClickEdit={(id) => onClickEdit(id)}
									onClickDelete={(id) => onClickDelete(id)}
									getOriginalIndex={getOriginalIndex}
								/>
							)}
							<DropZone
								message={formatMessage(
									{ id: 'uploads.dropzone.message', defaultMessage: 'Supported file formats: IFC, RVT, DGN, FBX, OBJ and <MoreLink>more</MoreLink>' },
									{ MoreLink: (child: string) => <a href="https://help.3drepo.io/en/articles/4798885-supported-file-formats" target="_blank" rel="noreferrer">{child}</a> },
								)}
								processFiles={(files) => { processFiles(files); }}
								hidden={isUploading}
							/>
						</Padding>
					</ScrollArea>
					<Sidebar
						open={Number.isInteger(selectedIndex) && !isUploading}
						onClick={() => setSelectedIndex(null)}
						noButton={!(Number.isInteger(selectedIndex))}
					>
						{
							Number.isInteger(selectedIndex)
								? (
									<span key={watch(`uploads.${origIndex}.containerName`)}>
										<SidebarForm
											value={
												getValues(`uploads.${origIndex}`)
											}
											key={sortedList[selectedIndex].uploadId}
											isNewContainer={
												!getValues(`uploads.${origIndex}.containerId`)
												&& !!getValues(`uploads.${origIndex}.containerName`)
											}
											isSpm={sortedList[selectedIndex].extension === 'spm'}
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
				</Container>
			</Modal>
		</FormProvider>
	);
};
