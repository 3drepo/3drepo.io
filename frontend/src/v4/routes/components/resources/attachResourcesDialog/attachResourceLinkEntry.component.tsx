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
import { TextField } from '@mui/material';
import { Field } from 'formik';
import { useState } from 'react';
import {
	FieldsRow,
	StyledFormControl
} from '../../../viewerGui/components/risks/components/riskDetails/riskDetails.styles';
import { RemoveButton } from '../removeButton.component';
import { ResourceListLinkItem } from './attachResourcesDialog.styles';

export const LinkEntry = ({ onClickRemove, index }) => {
	const [nameIsDirty, setNameIsDirty] = useState(false);
	const [linkIsDirty, setLinkIsDirty] = useState(false);
	const nameFieldName = `links.${index}.name`;
	const linkFieldName = `links.${index}.link`;

	return (
		<FieldsRow container justifyContent="space-between" flex={0.5}>
			<StyledFormControl>
				<Field name={nameFieldName} render={({ field, meta: { error, touched } }) => (
					<TextField {...field}
						placeholder="3D Repo"
						fullWidth
						error={!!((nameIsDirty || touched) && error)}
						helperText={((nameIsDirty || touched) && error)}
						onBlur={(...data) => {
							setNameIsDirty(true);
							field.onBlur(...data);
						}}
					/>
				)} />
			</StyledFormControl>
			<StyledFormControl>
				<ResourceListLinkItem>
					<Field name={linkFieldName} render={({ field, meta: { error, touched } }) => (
						<TextField {...field}
							placeholder="https://3drepo.com/"
							fullWidth
							error={!!((linkIsDirty || touched) && error)}
							helperText={((linkIsDirty || touched) && error)}
							onBlur={(...data) => {
								setLinkIsDirty(true);
								field.onBlur(...data);
							}}
						/>
					)} />
					<RemoveButton onClick={onClickRemove} />
				</ResourceListLinkItem>
			</StyledFormControl>
		</FieldsRow>
	);
};
