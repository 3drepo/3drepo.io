/**
 *  Copyright (C) 2019 3D Repo Ltd
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
import filesize from 'filesize';
import { Field, FieldArray } from 'formik';
import * as React from 'react';
import { EXTENSION_RE } from '../../../../constants/resources';
import { FileEntry } from './attachResourceFileEntry.component';
import { ResourcesListContainer, ResourcesListScroller } from './attachResourcesDialog.styles';
import { ResourcesDropzone } from './attachResourcesDropzone';

interface IProps {
	files: any[];
	uploadLimit: number;
	validateQuota: (files: []) => boolean;
	validateUploadLimit: (files: []) => boolean;
}

export class AttachResourceFiles extends React.PureComponent<IProps, any> {
	public insertFile = (fieldArray, file) => {
		const matches = file.name.match(EXTENSION_RE);
		const ext = matches ? matches[0] : '';
		const name = matches ? file.name.slice(0, matches.index) : file.name;

		fieldArray.insert(0, {name, ext, file});
	}

	public onAddFile = (fieldArray) => (acceptedFiles) => {
		acceptedFiles.forEach((file) => this.insertFile(fieldArray, file));
	}

	public render() {
		const {files, validateQuota, validateUploadLimit, uploadLimit} = this.props;
		return (
					<FieldArray
						name="files"
						render={(arrayHelpers) => (
						<div>
						{(files && files.length > 0) && (
							<ResourcesListScroller>
								<ResourcesListContainer>
									{files.map((file, index) =>
										<FileEntry
											key={index}
											index={index}
											entry={file}
											onClickRemove={() => arrayHelpers.remove(index)}
										/>
										)
									}
								</ResourcesListContainer>
							</ResourcesListScroller>
						)}
							<Field render={ ({ form }) => {
									const errorMessage = !validateQuota(form.values.files) ?
													'Quota exceeded! Try removing some files' :
													!validateUploadLimit(form.values.files) ?
													`File too large! Maximum attachment file size is ${filesize(uploadLimit, {fullform: true})}` : '';

									return (<ResourcesDropzone onDrop={this.onAddFile(arrayHelpers)} errorMessage={errorMessage} />);
							}} />
						</div>
				)}
				/>
		);
	}
}
