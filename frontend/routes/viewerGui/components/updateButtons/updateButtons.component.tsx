import React from 'react';

import { renderWhenTrue, renderWhenTrueOtherwise } from '../../../../helpers/rendering';
import { ImageButton } from '../imageButton/imageButton.component';
import PinButton from '../pinButton/pinButton.container';
import { FieldsRow } from '../risks/components/riskDetails/riskDetails.styles';
import { ViewpointButton } from '../viewpointButton/viewpointButton.component';
import { UpdateButtonsContainer } from './updateButtons.styles';

interface IProps {
	// risk: any;
	// active: boolean;
	isNew: boolean;
	canEditBasicProperty: boolean;
	disableViewer?: boolean;
	// canChangeAssigned: boolean;
	// jobs: any[];
	// values?: any;
	// criteria: any;
	onSavePin: (position) => void;
	onChangePin: (pin) => void;
	onUpdateViewpoint: () => void;
	hasImage: boolean;
	onTakeScreenshot: () => void;
	onUploadScreenshot: (image) => void;
	onShowScreenshotDialog: (config: any) => void;
}

export const UpdateButtons = ({
	isNew, canEditBasicProperty, disableViewer, onSavePin, onChangePin, onUpdateViewpoint, hasImage, ...props
}: IProps) => (
		<FieldsRow container alignItems="center" justify="space-between">
			{renderWhenTrueOtherwise(() => (
				<UpdateButtonsContainer>
					<PinButton
						onChange={onChangePin}
						onSave={onSavePin}
						disabled={!isNew && !canEditBasicProperty}
						hasPin
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
