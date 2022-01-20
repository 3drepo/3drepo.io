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

import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { formatMessage } from '@/v5/services/intl';
import { SettingsSidebar } from './settingsSidebar';

type IUploadFileForm = {
	openState: boolean;
	onClickClose: () => void;
};

export const UploadFileForm = ({ openState, onClickClose }: IUploadFileForm): JSX.Element => {
	const { control, register, handleSubmit, formState: { errors } } = useForm();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [sidebarHidden, setSidebarHidden] = useState(true);
	const [currentIndex, setcurrentIndex] = useState(0);

	const { fields, append } = useFieldArray({
		control,
		name: 'uploads',
	});

	const processFiles = (files) => {
		const filesToAppend = [];
		for (const file of files) {
			filesToAppend.push({
				upload: {
					progress: 0,
					failure: false,
				},
				revision: {
					file,
					tag: file.name,
					desc: '',
					importAnimations: false,
				},
				container: {
					_id: '',
					name: '',
					unit: 'mm',
					type: 'Uncategorised',
					desc: '',
					code: '',
				},
			});
		}
		append(filesToAppend);
	};

	const onSubmit = () => {
		onClickClose();
	};
	};

	return (
		<FormModal
			open={openState}
			onSubmit={handleSubmit(onSubmit)}
			onClickClose={onClickClose}
			confirmLabel="Upload files"
			title="Add files for upload"
			subtitle="Drag and drop or browse your computer"
		>
			<Container>
					<DropZone
						message={formatMessage(
							{ id: 'containers.upload.message', defaultMessage: 'Supported file formats: IFC, RVT, DGN, FBX, OBJ and <MoreLink>more</MoreLink>' },
							{ MoreLink: (child: string) => <a href="https://help.3drepo.io/en/articles/4798885-supported-file-formats" target="_blank" rel="noreferrer">{child}</a> },
						)}
						processFiles={(files) => { processFiles(files); }}
					/>
				<SettingsSidebar
					item={fields.length ? fields[currentIndex] : null}
					index={currentIndex}
					open={sidebarOpen}
					onClick={() => setSidebarOpen(!sidebarOpen)}
					hidden={sidebarHidden}
					register={register}
					errors={errors}
					control={control}
				/>
			</Container>
		</FormModal>
	);
};
