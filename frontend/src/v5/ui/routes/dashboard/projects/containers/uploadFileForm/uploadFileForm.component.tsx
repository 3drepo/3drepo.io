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

import React, { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';
import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { formatMessage } from '@/v5/services/intl';
import { Sidebar } from '@controls/sideBar';
import { UploadFieldArray } from '@/v5/store/containers/containers.types';
import { UploadsSchema } from '@/v5/validation/containers';
import { UploadListHeader } from './uploadListHeader';
import { UploadListHeaderLabel } from './uploadListHeader/uploadListHeaderLabel';
import { UploadList } from './uploadList';
import { SidebarForm } from './sidebarForm';
import { Container, Content, DropZone } from './uploadFileForm.styles';

type IUploadFileForm = {
	openState: boolean;
	onClickClose: () => void;
};

export const UploadFileForm = ({ openState, onClickClose }: IUploadFileForm): JSX.Element => {
	const [selectedIndex, setSelectedIndex] = useState<number>(null);
	const methods = useForm<UploadFieldArray>({
		mode: 'onChange',
		resolver: yupResolver(UploadsSchema),
	});
	const { control, handleSubmit, formState, trigger, getValues, setValue, watch } = methods;
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'uploads',
		keyName: 'uploadId',
	});

	const processFiles = (files: File[]) => {
		const filesToAppend = [];
		for (const file of files) {
			filesToAppend.push({
				file,
				extension: file.name.split('.').slice(-1)[0],
				revisionTag: file.name,
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

	const onClickEdit = (id: number) => {
		setSelectedIndex(id);
	};

	const onClickDelete = (id: number) => {
		if (id < selectedIndex) setSelectedIndex(selectedIndex - 1);
		if (id === selectedIndex) setSelectedIndex(null);
		remove(id);
	};

	const onSubmit = () => {
		onClickClose();
	};

	return (
		<FormProvider {...methods}>
			<FormModal
				open={openState}
				onSubmit={handleSubmit(onSubmit)}
				onClickClose={onClickClose}
				confirmLabel="Upload files"
				title="Add files for upload"
				subtitle="Drag and drop or browse your computer"
				isValid={formState.isValid}
			>
				<Container>
					<Content>
						<UploadListHeader>
							<UploadListHeaderLabel name="filename">
								<span> Filename </span>
							</UploadListHeaderLabel>
							<UploadListHeaderLabel name="destination">
								<span> Destination </span>
							</UploadListHeaderLabel>
							<UploadListHeaderLabel name="revisionName">
								<span> Revision Name </span>
							</UploadListHeaderLabel>
						</UploadListHeader>
						<UploadList
							values={fields}
							onClickEdit={(id) => onClickEdit(id)}
							onClickDelete={(id) => onClickDelete(id)}
						/>
						<DropZone
							message={formatMessage(
								{ id: 'containers.upload.message', defaultMessage: 'Supported file formats: IFC, RVT, DGN, FBX, OBJ and <MoreLink>more</MoreLink>' },
								{ MoreLink: (child: string) => <a href="https://help.3drepo.io/en/articles/4798885-supported-file-formats" target="_blank" rel="noreferrer">{child}</a> },
							)}
							processFiles={(files) => { processFiles(files); }}
						/>
					</Content>
					<Sidebar
						key={watch(`uploads.${selectedIndex}.containerId`)}
						open={Number.isInteger(selectedIndex)}
						onClick={() => setSelectedIndex(null)}
						noButton={!(Number.isInteger(selectedIndex))}
					>
						{
							Number.isInteger(selectedIndex)
								? (
									<>
										<SidebarForm
											value={getValues(`uploads.${selectedIndex}`)}
											key={fields[selectedIndex].uploadId}
											isNewContainer={
												!getValues(`uploads.${selectedIndex}.containerId`)
												&& !!getValues(`uploads.${selectedIndex}.containerName`)
											}
											isSpm={fields[selectedIndex].extension === 'spm'}
											onChange={(field: string, val: string | boolean) => {
												// @ts-ignore
												setValue(`uploads.${selectedIndex}.${field}`, val);
												// @ts-ignore
												trigger(`uploads.${selectedIndex}.${field}`);
											}}
										/>
									</>
								)
								: <></>
						}
					</Sidebar>
				</Container>
			</FormModal>
		</FormProvider>
	);
};
