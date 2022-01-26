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

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { formatMessage } from '@/v5/services/intl';
import { Sidebar } from '@controls/sideBar';
import { UploadListHeader } from './uploadListHeader';
import { UploadListHeaderLabel } from './uploadListHeader/uploadListHeaderLabel';
import { UploadList } from './uploadList';
import { SidebarForm } from './sidebarForm';
import { Container, Content, DropZone } from './uploadFileForm.styles';

type IUploadFileForm = {
	openState: boolean;
	onClickClose: () => void;
};

export type IUploadItemFields = {
	id: string;
	file: File;
	revisionTag: string;
	revisionDesc?: string;
	importAnimations?: boolean;
	containerId?: string;
	containerName: string;
	containerUnit: string;
	containerType: string;
	containerDesc?: string;
	containerCode?: string;
};

export type IUploadFormFields = {
	uploads: IUploadItemFields[];
};

export const UploadSchema = Yup.object().shape({
	revisionTag: Yup.string()
		.min(2,
			formatMessage({
				id: 'uploadFileForm.revision.tag.error.min',
				defaultMessage: 'Container Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'uploadFileForm.revision.tag.error.max',
				defaultMessage: 'Revision Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'uploadFileForm.revision.tag.error.required',
				defaultMessage: 'Revision Name is a required field',
			}),
		),
	containerName: Yup.string()
		.min(3,
			formatMessage({
				id: 'containers.creation.name.error.min',
				defaultMessage: 'Container Name must be at least 2 characters',
			}))
		.max(120,
			formatMessage({
				id: 'containers.creation.name.error.max',
				defaultMessage: 'Container Name is limited to 120 characters',
			}))
		.required(
			formatMessage({
				id: 'containers.creation.name.error.required',
				defaultMessage: 'Container Name is a required field',
			}),
		),
	unit: Yup.string().required().default('mm'),
	type: Yup.string().required().default('Uncategorised'),
	containerCode: Yup.string()
		.max(50,
			formatMessage({
				id: 'containers.creation.code.error.max',
				defaultMessage: 'Code is limited to 50 characters',
			}))
		.matches(/^[A-Za-z0-9]*$/,
			formatMessage({
				id: 'containers.creation.code.error.characters',
				defaultMessage: 'Code can only consist of letters and numbers',
			})),
	containerDesc: Yup.string()
		.max(50,
			formatMessage({
				id: 'containers.creation.description.error.max',
				defaultMessage: 'Container Description is limited to 50 characters',
			})),
	revisionDesc: Yup.string()
		.max(50,
			formatMessage({
				id: 'uploadSidebar.revisionDesc.error.max',
				defaultMessage: 'Revision Description is limited to 50 characters',
			})),
});

const UploadsSchema = Yup.object().shape({
	uploads: Yup
		.array()
		.of(UploadSchema)
		.required()
		.min(1),
});

export const UploadFileForm = ({ openState, onClickClose }: IUploadFileForm): JSX.Element => {
	const [currentIndex, setCurrentIndex] = useState(null);
	const methods = useForm<IUploadFormFields>({
		mode: 'onChange',
		resolver: yupResolver(UploadsSchema),
	});
	const { control, handleSubmit, formState } = methods;
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'uploads',
	});
	const isSidebarOpen = Number.isInteger(currentIndex) && 'id' in fields[currentIndex];

	const processFiles = (files) => {
		const filesToAppend = [];
		for (const file of files) {
			filesToAppend.push({
				file,
				revisionTag: file.name,
				revisionDesc: '',
				importAnimations: false,
				containerName: '',
				containerId: '',
				containerUnit: 'mm',
				containerType: 'Uncategorised',
				containerCode: '',
				containerDesc: '',
			});
		}
		append(filesToAppend);
	};

	const onClickEdit = (id) => {
		setCurrentIndex(id);
	};

	const onClickDelete = (id) => {
		setCurrentIndex(null);
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
						open={isSidebarOpen}
						onClick={() => setCurrentIndex(null)}
						noButton={!isSidebarOpen}
					>
						{
							fields.length
								? (
									<SidebarForm
										index={currentIndex}
										fieldKey={Number.isInteger(currentIndex) ? fields[currentIndex].id : ''}
									/>
								)
								: <></>
						}
					</Sidebar>
				</Container>
			</FormModal>
		</FormProvider>
	);
};
