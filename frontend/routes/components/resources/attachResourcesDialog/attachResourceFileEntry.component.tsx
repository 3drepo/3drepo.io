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

import { TextField } from '@material-ui/core';
import { Field } from 'formik';
import { get } from 'lodash';
import * as React from 'react';
import {
	FieldsRow,
	StyledFormControl
} from '../../../viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { RemoveButton } from '../resources.component';
import {  ResourceListItem } from './attachResourcesDialog.styles';

export const FileEntry = ({onClickRemove, index, entry}) => {
	const nameFieldName = `files.${index}.name`;
	const fileFieldName = `files.${index}.file`;

	return (
		<FieldsRow container justify="space-between" flex={0.5}>
			<StyledFormControl>
				<Field name={nameFieldName} render={({ field, form }) => (
					<TextField {...field}
						fullWidth
						error={Boolean(get(form.errors, nameFieldName))}
						helperText={get(form.errors, nameFieldName)}
					/>
				)} />

			</StyledFormControl>
			<StyledFormControl>
				<Field type="hidden" name={fileFieldName} />
				<ResourceListItem>
					<span> {entry.file.name} </span>
					<RemoveButton onClick={onClickRemove} />
				</ResourceListItem>
			</StyledFormControl>
		</FieldsRow>
	);
};
