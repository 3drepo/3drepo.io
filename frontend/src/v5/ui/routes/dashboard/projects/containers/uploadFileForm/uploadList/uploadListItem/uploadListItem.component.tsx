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

import { useEffect, useState } from 'react';
import DeleteIcon from '@assets/icons/outlined/delete-outlined.svg';
import EditIcon from '@assets/icons/outlined/edit-outlined.svg';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IContainer, UploadItemFields } from '@/v5/store/containers/containers.types';
import filesize from 'filesize';
import { filesizeTooLarge } from '@/v5/store/containers/containers.helpers';
import { ListItemSchema } from '@/v5/validation/containerAndFederationSchemes/containerSchemes';
import { RevisionsHooksSelectors, FederationsHooksSelectors } from '@/v5/services/selectorsHooks';
import { UploadListItemFileIcon } from './components/uploadListItemFileIcon/uploadListItemFileIcon.component';
import { UploadListItemRow } from './components/uploadListItemRow/uploadListItemRow.component';
import { UploadListItemTitle } from './components/uploadListItemTitle/uploadListItemTitle.component';
import { Button, Destination, RevisionTag } from './uploadListItem.styles';
import { UploadProgress } from './uploadProgress';

type IUploadListItem = {
	item: UploadItemFields;
	defaultValues: {
		containerName: string;
		revisionTag: string;
	}
	isSelected: boolean;
	isUploading: boolean;
	onClickEdit: () => void;
	onClickDelete: () => void;
	onChange: (name, val) => void;
};

export const UploadListItem = ({
	item,
	defaultValues,
	onClickEdit,
	onClickDelete,
	isSelected,
	isUploading,
	onChange,
}: IUploadListItem): JSX.Element => {
	const federationsNames = FederationsHooksSelectors.selectFederations().map(({ name }) => name);
	const [containersNamesInUse, setContainersNamesInUse] = useState([]);
	const {
		control,
		formState: { errors },
		getValues,
		setValue,
		trigger,
		watch,
		setError,
	} = useForm<UploadItemFields>({
		defaultValues,
		mode: 'onChange',
		resolver: yupResolver(ListItemSchema),
		context: { alreadyExistingNames: containersNamesInUse.concat(federationsNames) },
	});

	const uploadErrorMessage: string = RevisionsHooksSelectors.selectUploadError(item.uploadId);

	const updateValue = (name) => onChange(name, watch(name));
	const onPropertyChange = (name, value) => {
		setValue(name, value);
		updateValue(name);
	};

	useEffect(() => {
		if (getValues('containerName')) trigger('containerName');
	}, [watch('containerName')]);

	useEffect(() => {
		trigger('revisionTag');
		updateValue('revisionTag');
		const largeFilesizeMessage = filesizeTooLarge(item.file);
		if (largeFilesizeMessage) {
			setError('file', { type: 'custom', message: largeFilesizeMessage });
		}
	}, [watch('revisionTag')]);

	return (
		<UploadListItemRow
			key={item.uploadId}
			selected={isSelected}
		>
			<UploadListItemFileIcon extension={item.extension} />
			<UploadListItemTitle
				name={item.file.name}
				filesize={filesize(item.file.size)}
				isSelected={isSelected}
				errorMessage={errors.file?.message}
			/>
			<Destination
				disabled={isUploading}
				errors={errors}
				control={control}
				defaultValue={defaultValues.containerName}
				onPropertyChange={onPropertyChange}
				containersNamesInUse={containersNamesInUse}
				setContainersNamesInUse={setContainersNamesInUse}
			/>
			<RevisionTag
				control={control}
				disabled={isUploading}
				isSelected={isSelected}
				errorMessage={errors.revisionTag?.message}
			/>
			{isUploading
				? <UploadProgress uploadId={item.uploadId} errorMessage={uploadErrorMessage} />
				: (
					<>
						<Button variant={isSelected ? 'secondary' : 'primary'} onClick={onClickEdit}>
							<EditIcon />
						</Button>
						<Button variant={isSelected ? 'secondary' : 'primary'} onClick={onClickDelete}>
							<DeleteIcon />
						</Button>
					</>
				)}
		</UploadListItemRow>
	);
};
