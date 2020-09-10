/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import { renderWhenTrue, renderWhenTrueOtherwise } from '../../../../helpers/rendering';
import { ImageButton } from '../imageButton/imageButton.component';
import PinButton from '../pinButton/pinButton.container';
import { FieldsRow } from '../risks/components/riskDetails/riskDetails.styles';
import { ViewpointButton } from '../viewpointButton/viewpointButton.component';
import { UpdateButtonsContainer } from './updateButtons.styles';

interface IProps {
	isNew: boolean;
	canEditBasicProperty: boolean;
	disableViewer?: boolean;
	hasPin: boolean;
	onSavePin: (position) => void;
	onChangePin: (pin) => void;
	onUpdateViewpoint: () => void;
	hasImage: boolean;
	onTakeScreenshot: () => void;
	onUploadScreenshot: (image) => void;
	onShowScreenshotDialog: (config: any) => void;
}

export const UpdateButtons = ({
	isNew, canEditBasicProperty, disableViewer, onSavePin, onChangePin, onUpdateViewpoint, hasImage, hasPin, ...props
}: IProps) => (
		<FieldsRow container alignItems="center" justify="space-between">
			{renderWhenTrueOtherwise(() => (
				<UpdateButtonsContainer center={!isNew}>
					<PinButton
						onChange={onChangePin}
						onSave={onSavePin}
						disabled={!isNew && !canEditBasicProperty}
						hasPin={hasPin}
					/>
					<ImageButton
						hasImage={Boolean(hasImage)}
						onTakeScreenshot={props.onTakeScreenshot}
						onUploadScreenshot={props.onUploadScreenshot}
						onShowScreenshotDialog={props.onShowScreenshotDialog}
						disabled={!canEditBasicProperty}
					/>
					{renderWhenTrue(() => (
						<ViewpointButton
							onUpdate={onUpdateViewpoint}
							disabled={!canEditBasicProperty}
						/>
					))(!isNew)}
				</UpdateButtonsContainer>
			), () => (
				<UpdateButtonsContainer>
					<ImageButton
						hasImage={Boolean(hasImage)}
						onTakeScreenshot={props.onTakeScreenshot}
						onUploadScreenshot={props.onUploadScreenshot}
						onShowScreenshotDialog={props.onShowScreenshotDialog}
						disabled={!canEditBasicProperty}
						disableScreenshot
					/>
				</UpdateButtonsContainer>
			))(!disableViewer)}
		</FieldsRow>
);
