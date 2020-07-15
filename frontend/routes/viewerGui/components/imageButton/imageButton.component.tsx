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
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import Tooltip from '@material-ui/core/Tooltip';
import ImageIcon from '@material-ui/icons/Image';

import { renderWhenTrue, renderWhenTrueOtherwise } from '../../../../helpers/rendering';
import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import {
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { ScreenshotDialog } from '../../../components/screenshotDialog';
import { FileUploadInvoker } from '../commentForm/commentForm.styles';
import { ContainedButton } from '../containedButton/containedButton.component';
import { Container as ButtonContainer } from '../pinButton/pinButton.styles';

interface IProps {
	hasImage?: boolean;
	onShowScreenshotDialog: (config: any) => void;
	onTakeScreenshot?: (disableViewpointSuggestion: boolean) => void;
	onUploadScreenshot?: (image, disableViewpointSuggestion: boolean) => void;
	onUploadImage?: () => void;
	disabled?: boolean;
	disableScreenshot?: boolean;
}

const UploadImage = ({ onUploadScreenshot, onShowScreenshotDialog, asMenuItem = false, ...props }) => {
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const resetFileInput = () => {
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();

		reader.addEventListener('load', () => {
			onShowScreenshotDialog({
				sourceImage: reader.result,
				onSave: (screenshot) => {
					onUploadScreenshot(screenshot, true);
					resetFileInput();
				},
				onCancel: () => resetFileInput(),
				template: ScreenshotDialog,
				notFullScreen: true,
			});
		}, false);

		reader.readAsDataURL(file);
	};

	const fileInvoker = <FileUploadInvoker id="file-upload" ref={fileInputRef} onChange={handleFileUpload} />;

	const handleOnClickButton = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	return (
		<label htmlFor="file-upload">
			{renderWhenTrueOtherwise(() => (
					<StyledListItem button>
						<StyledItemText>
							Upload image...
						</StyledItemText>
					</StyledListItem>
			), () => (
				<ContainedButton icon={props.icon} onClick={handleOnClickButton}>
					{props.children}
				</ContainedButton>
			))(asMenuItem)}
			{fileInvoker}
		</label>
	);
};

const CreateScreenshot = ({ disableScreenshot, onTakeScreenshot }) => (
	<>
		{renderWhenTrue(() => (
			<StyledListItem button onClick={() => onTakeScreenshot(false)}>
				<StyledItemText>
					Create Screenshot...
				</StyledItemText>
			</StyledListItem>
		))(!disableScreenshot)}
	</>
);

export const UpdateImageButton = ({ hasImage, disabled, ...props }: IProps) => {
	const imageLabel = !hasImage ? 'Add Image' : 'Edit Image';

	return (
		<ButtonContainer {...props}>
			{renderWhenTrueOtherwise(() => (
				<UploadImage
					asMenuItem={false}
					onShowScreenshotDialog={props.onShowScreenshotDialog}
					onUploadScreenshot={props.onUploadScreenshot}
					icon={ImageIcon}
				>
					{imageLabel}
				</UploadImage>
			), () => (
				<ButtonMenu
					renderButton={(p) => (
						<ContainedButton
							icon={ImageIcon}
							disabled={disabled}
							{...p}
						>
							{imageLabel}
						</ContainedButton>
					)}
					renderContent={() => (
						<MenuList>
							<CreateScreenshot
								disableScreenshot={props.disableScreenshot}
								onTakeScreenshot={props.onTakeScreenshot}
							/>
							<UploadImage
								asMenuItem
								onShowScreenshotDialog={props.onShowScreenshotDialog}
								onUploadScreenshot={props.onUploadScreenshot}
							/>
						</MenuList>
					)}
					PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
					PopoverProps={{ anchorOrigin: { vertical: 'bottom', horizontal: 'center' } }}
				/>
			))(props.disableScreenshot)}

		</ButtonContainer>
	);
};

export const ImageButton = ({ ...props }: IProps) => {
	return (
		<>
			{renderWhenTrueOtherwise(() => (
				<Tooltip title={`Sorry, You do not have enough permissions to do this.`}>
					<UpdateImageButton {...props} />
				</Tooltip>
			), () => (
				<UpdateImageButton {...props} />
			))(props.disabled)}
		</>
	);
};
