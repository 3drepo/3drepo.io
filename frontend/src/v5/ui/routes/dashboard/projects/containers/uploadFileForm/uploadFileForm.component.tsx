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
import { useFieldArray, useForm } from 'react-hook-form';

import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { formatMessage } from '@/v5/services/intl';
import { UploadListHeader } from './uploadListHeader';
import { UploadListHeaderLabel } from './uploadListHeader/uploadListHeaderLabel';
import { UploadList } from './uploadList';
import { SettingsSidebar } from './settingsSidebar';
import { Container, Content, DropZone } from './uploadFileForm.styles';

type IUploadFileForm = {
	openState: boolean;
	onClickClose: () => void;
};

export type IUploadItemFields = {
	id?: string;
	container: {
		_id: string;
		containerName: string;
		unit: string;
		type: string;
		desc?: string;
		code?: string;
	};
	revision: {
		tag: string;
		file: File;
		desc?: string;
		importAnimations?: boolean;
	};
};

export type IUploadFormFields = {
	uploads: IUploadItemFields[];
};

const ContainerSchema = Yup.object({
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
	code: Yup.string()
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
	desc: Yup.string()
		.max(50,
			formatMessage({
				id: 'containers.creation.description.error.max',
				defaultMessage: 'Container Description is limited to 50 characters',
			})),
});

export const RevisionSchema = Yup.object({
	tag: Yup.string()
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
	desc: Yup.string()
		.max(50,
			formatMessage({
				id: 'uploadFileForm.revision.description.error.max',
				defaultMessage: 'Revision Description is limited to 50 characters',
			})),

});

const UploadsSchema = Yup.object().shape({
	uploads: Yup
		.array()
		.of(Yup.object().shape({
			container: ContainerSchema,
			revision: RevisionSchema,
		}))
		.required()
		.min(1),
});

export const UploadFileForm = ({ openState, onClickClose }: IUploadFileForm): JSX.Element => {
	const [currentIndex, setcurrentIndex] = useState(null);
	const [selectedItem, setSelectedItem] = useState({});

	const { control, register, handleSubmit, formState, formState: { errors } } = useForm<IUploadFormFields>({
		mode: 'onChange',
		resolver: yupResolver(UploadsSchema),
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'uploads',
	});

	const processFiles = (files) => {
		const filesToAppend = [];
		for (const file of files) {
			filesToAppend.push({
				revision: {
					file,
					tag: file.name,
					desc: '',
					importAnimations: false,
				},
				container: {
					_id: '',
					containerName: '',
					unit: 'mm',
					type: 'Uncategorised',
					desc: '',
					code: '',
				},
			});
		}
		append(filesToAppend);
	};

	const onClickEdit = (id) => {
		setcurrentIndex(id);
		setSelectedItem(fields[id]);
	};

	const onClickDelete = (id) => {
		setSelectedItem({});
		remove(id);
	};

	const onSubmit = () => {
		onClickClose();
	};

	return (
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
						items={fields}
						onClickEdit={(id) => onClickEdit(id)}
						onClickDelete={(id) => onClickDelete(id)}
						control={control}
						errors={errors}
					/>
					<DropZone
						message={formatMessage(
							{ id: 'containers.upload.message', defaultMessage: 'Supported file formats: IFC, RVT, DGN, FBX, OBJ and <MoreLink>more</MoreLink>' },
							{ MoreLink: (child: string) => <a href="https://help.3drepo.io/en/articles/4798885-supported-file-formats" target="_blank" rel="noreferrer">{child}</a> },
						)}
						processFiles={(files) => { processFiles(files); }}
					/>
				</Content>
				<SettingsSidebar
					item={selectedItem}
					index={currentIndex}
					onClose={() => setSelectedItem({})}
					register={register}
					errors={errors}
					control={control}
				/>
			</Container>
		</FormModal>
	);
};
