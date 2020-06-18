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

import ImageIcon from '@material-ui/icons/Image';

import { ButtonMenu } from '../../../components/buttonMenu/buttonMenu.component';
import {
	MenuList,
	StyledItemText,
	StyledListItem
} from '../../../components/filterPanel/components/filtersMenu/filtersMenu.styles';
import { ScreenshotDialog } from '../../../components/screenshotDialog';
import { ContainedButton } from '../containedButton/containedButton.component';
import { FileUploadInvoker } from '../newCommentForm/newCommentForm.styles';
import { Container as ButtonContainer } from '../pinButton/pinButton.styles';

interface IProps {
	hasImage?: boolean;
	onShowScreenshotDialog: (config: any) => void;
	onTakeScreenshot?: () => void;
	onUploadScreenshot?: (image) => void;
	onUploadImage?: () => void;
	disabled?: boolean;
	disableScreenshot?: boolean;
}

const UploadImage = ({ onUploadScreenshot, onShowScreenshotDialog }) => {
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
					onUploadScreenshot(screenshot);
					resetFileInput();
				},
				onCancel: () => resetFileInput(),
				template: ScreenshotDialog,
				notFullScreen: true,
			});
		}, false);

		reader.readAsDataURL(file);
	};

	return (
		<label htmlFor="file-upload">
			<StyledListItem button>
				<StyledItemText>
					Upload image...
				</StyledItemText>
				<FileUploadInvoker id="file-upload" ref={fileInputRef} onChange={handleFileUpload} />
			</StyledListItem>
		</label>
	);
};

export const ImageButton = ({ hasImage, disabled, ...props }: IProps) => {
	const imageLabel = !hasImage ? 'Add Image' : 'Edit Image';
	return (
		<ButtonContainer>
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
						<StyledListItem button onClick={props.onTakeScreenshot}>
							<StyledItemText>
								Create Screenshot...
							</StyledItemText>
						</StyledListItem>
						<UploadImage
							onShowScreenshotDialog={props.onShowScreenshotDialog}
							onUploadScreenshot={props.onUploadScreenshot}
						/>
					</MenuList>
				)}
				PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
				PopoverProps={{ anchorOrigin: { vertical: 'bottom', horizontal: 'center' } }}
			/>
		</ButtonContainer>
	);
};
