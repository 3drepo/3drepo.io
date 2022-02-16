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
import { DashboardListHeaderLabel } from '@components/dashboard/dashboardList';
import { FormattedMessage } from 'react-intl';
import { useOrderedList } from '@components/dashboard/dashboardList/useOrderedList';
import { SortingDirection } from '@components/dashboard/dashboardList/dashboardList.types';
import { UploadList } from './uploadList';
import { SidebarForm } from './sidebarForm';
import { Container, Content, DropZone, UploadsListHeader } from './uploadFileForm.styles';

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
	const { control, handleSubmit, formState, trigger, getValues, setValue } = methods;
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'uploads',
		keyName: 'uploadId',
	});

	const DEFAULT_SORT_CONFIG = {
		column: 'file',
		direction: SortingDirection.ASCENDING,
	};
	const { sortedList, setSortConfig } = useOrderedList(fields || [], DEFAULT_SORT_CONFIG);

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

	const indexMap = new Map(fields.map(({ uploadId }, index) => [uploadId, index]));
	const getOriginalIndex = (sortedIndex) => indexMap.get(sortedList[sortedIndex].uploadId);

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
						<div hidden={!fields.length}>
							<UploadsListHeader onSortingChange={setSortConfig} defaultSortConfig={DEFAULT_SORT_CONFIG}>
								<DashboardListHeaderLabel key="file" name="file">
									<FormattedMessage id="uploads.list.header.filename" defaultMessage="Filename" />
								</DashboardListHeaderLabel>
								<DashboardListHeaderLabel key="destination" width={285}>
									<FormattedMessage id="uploads.list.header.destination" defaultMessage="Destination" />
								</DashboardListHeaderLabel>
								<DashboardListHeaderLabel key="revisionName" width={297}>
									<FormattedMessage id="uploads.list.header.revisionName" defaultMessage="Revision Name" />
								</DashboardListHeaderLabel>
							</UploadsListHeader>
						</div>
						<UploadList
							values={sortedList}
							selectedIndex={selectedIndex}
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
						open={Number.isInteger(selectedIndex)}
						onClick={() => setSelectedIndex(null)}
						noButton={!(Number.isInteger(selectedIndex))}
					>
						{
							Number.isInteger(selectedIndex)
								? (
									<>
										<SidebarForm
											value={
												getValues(`uploads.${getOriginalIndex(selectedIndex)}`)
											}
											key={sortedList[selectedIndex].uploadId}
											isNewContainer={!sortedList[selectedIndex].containerId}
											isSpm={sortedList[selectedIndex].extension === 'spm'}
											onChange={(field: string, val: string | boolean) => {
												// @ts-ignore
												setValue(`uploads.${getOriginalIndex(selectedIndex)}.${field}`, val);
												// @ts-ignore
												trigger(`uploads.${getOriginalIndex(selectedIndex)}.${field}`);
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
