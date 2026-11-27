/**
 *  Copyright (C) 2026 3D Repo Ltd
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

import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams } from 'react-router-dom';

import CancelIcon from '@assets/icons/controls/clear_circle.svg';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { ViewpointsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import {
	IconsGroup,
	NewViewpointName,
	StyledForm,
	ViewpointItem,
	SaveButton,
	IconButton,
	ViewThumbnail,
} from './viewItem.styles';
import { formatMessage } from '@/v5/services/intl';
import { ViewItemSchema } from '@/v5/validation/viewpointSchemes/viewpointSchemes';
import { IViewpoint } from '@/v5/store/viewpoints/viewpoints.types';
import { getScreenshotFromView } from '@/v5/helpers/viewpoint.helpers';

interface IViewItem {
	viewpoint: IViewpoint;
}

export const NewView = ({ viewpoint }: IViewItem) => {
	const { teamspace, containerOrFederation } = useParams<ViewerParams>();
	const screenshot = getScreenshotFromView(viewpoint);
	const preserveDraft = useRef(true);
	const [hasEditedName, setHasEditedName] = useState(false);

	const { control, handleSubmit, formState: { errors }, getValues, clearErrors } = useForm({
		mode: 'onChange',
		defaultValues: { name: '' },
		resolver: yupResolver(ViewItemSchema),
	});

	const onClickCancelEdit = (e: SyntheticEvent) => {
		e.stopPropagation();
		preserveDraft.current = false;
		ViewpointsActionsDispatchers.setNewViewpoint(null);
	};

	const onSubmit = (values) => {
		preserveDraft.current = false;
		const newName = values.name || viewpoint.name;
		const newViewpoint = { ...viewpoint, name: newName };
		ViewpointsActionsDispatchers.createViewpoint(teamspace, containerOrFederation, newViewpoint);
	};

	useEffect(() => () => {
		if (preserveDraft.current) {
			ViewpointsActionsDispatchers.setNewViewpoint({
				...viewpoint,
				name: getValues('name') || viewpoint.name,
			});
		}
	}, [getValues]);

	return (
		<ViewpointItem active>
			<ViewThumbnail src={screenshot} alt={viewpoint.name} />
			<StyledForm onSubmit={handleSubmit(onSubmit, () => {
				if (!hasEditedName) {
					clearErrors('name');
					onSubmit({ name: viewpoint.name });
				}
			})}>
				<Controller
					name="name"
					control={control}
					render={({ field: { ref, onBlur, onChange, value } }) => (
						<NewViewpointName
							fullWidth
							error={Boolean(errors.name)}
							helperText={errors.name?.message}
							label={formatMessage({ id: 'views.viewItem.nameFieldLabel', defaultMessage: 'View name' })}
							placeholder={viewpoint.name}
							autoFocus
							name="name"
							value={value}
							inputRef={ref}
							onChange={(event) => {
								setHasEditedName(true);
								onChange(event);
							}}
							onBlur={onBlur}
							onKeyDown={(e) => e.stopPropagation()}
						/>
					)}
				/>
				<IconsGroup>
					<IconButton onClick={onClickCancelEdit}>
						<CancelIcon />
					</IconButton>
					<SaveButton disabled={hasEditedName && Boolean(errors.name)} type="submit">{formatMessage({ id: 'views.viewItem.saveButton', defaultMessage: 'Save' })}</SaveButton>
				</IconsGroup>
			</StyledForm>
		</ViewpointItem>
	);
};
