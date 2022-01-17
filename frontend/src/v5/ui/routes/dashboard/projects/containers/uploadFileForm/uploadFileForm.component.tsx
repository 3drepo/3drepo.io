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

import React from 'react';
import { useForm } from 'react-hook-form';

import { FormModal } from '@controls/modal/formModal/formDialog.component';
import { formatMessage } from '@/v5/services/intl';
import { Container, DropZone } from './uploadFileForm.styles';

type IUploadFileForm = {
	openState: boolean;
	onClickClose: () => void;
};

export const UploadFileForm = ({ openState, onClickClose }: IUploadFileForm): JSX.Element => {
	const { register, handleSubmit } = useForm();

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
		>
			<Container>
				<input {...register('firstName')} placeholder="First name" />
				<DropZone
					message={formatMessage(
						{ id: 'containers.upload.message', defaultMessage: 'Supported file formats: IFC, RVT, DGN, FBX, OBJ and <MoreLink>more</MoreLink>' },
						{ MoreLink: (child: string) => <a href="https://help.3drepo.io/en/articles/4798885-supported-file-formats" target="_blank" rel="noreferrer">{child}</a> },
					)}
					processFiles={() => { }}
				/>
			</Container>
		</FormModal>
	);
};
