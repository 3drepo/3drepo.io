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
import { useRef, forwardRef, Ref } from 'react';
import Tooltip from '@mui/material/Tooltip';
import ImageIcon from '@mui/icons-material/Image';
import { noop } from 'lodash';

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
	showScreenshotDialog: (config: any) => void;
	takeScreenshot?: (disableViewpointSuggestion: boolean) => void;
	uploadScreenshot?: (image, disableViewpointSuggestion: boolean) => void;
	uploadImage?: () => void;
	hasNoPermission?: boolean;
	disabled?: boolean;
	disableScreenshot?: boolean;
	close?: (e) => void;
}

const UploadImage = ({ uploadScreenshot, showScreenshotDialog, close = noop, asMenuItem = false, ...props }) => {
	const fileInputRef = useRef<HTMLInputElement>(null);

	const resetFileInput = (e) => {
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		close(e);
	};

	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();

		reader.addEventListener('load', () => {
			showScreenshotDialog({
				sourceImage: reader.result,
				onSave: (screenshot) => {
					uploadScreenshot(screenshot, false);
					resetFileInput(event);
				},
				onCancel: () => resetFileInput(event),
				template: ScreenshotDialog,
				notFullScreen: true,
			});
		}, false);

		reader.readAsDataURL(file);
	};

	const fileInvoker = <FileUploadInvoker id="file-upload" ref={fileInputRef} onChange={handleFileUpload} />;

	const handleOnClickButton = (e) => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
			close(e);
		}
	};

	return (
		<label htmlFor="file-upload">
			{renderWhenTrueOtherwise(() => (
					<StyledListItem>
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

const CreateScreenshot = ({ disableScreenshot, takeScreenshot, ...props }) => {
	const handleOnClick = (e) => {
		takeScreenshot(false);
		props.close(e);
	};
	return (
		<>
			{renderWhenTrue(() => (
					<StyledListItem onClick={handleOnClick}>
						<StyledItemText>
							Create Screenshot...
						</StyledItemText>
					</StyledListItem>
			))(!disableScreenshot)}
		</>
	);
};

export const UpdateImageButton = forwardRef(({ hasImage, disabled, ...props }: IProps, ref: Ref<HTMLSpanElement>) => {
	const imageLabel = !hasImage ? 'Add Image' : 'Edit Image';

	return (
		<ButtonContainer ref={ref} {...props}>
			{renderWhenTrueOtherwise(() => (
				<UploadImage
					asMenuItem={false}
					showScreenshotDialog={props.showScreenshotDialog}
					uploadScreenshot={props.uploadScreenshot}
					icon={ImageIcon}
				>
					{imageLabel}
				</UploadImage>
			), () => (
				<ButtonMenu
					renderButton={({ IconProps, Icon, ...p }) => (
						<ContainedButton
							icon={ImageIcon}
							disabled={disabled}
							{...p}
						>
							{imageLabel}
						</ContainedButton>
					)}
					renderContent={({ close }) => (
						<MenuList>
							<CreateScreenshot
								close={close}
								disableScreenshot={props.disableScreenshot}
								takeScreenshot={props.takeScreenshot}
							/>
							<UploadImage
								asMenuItem
								close={close}
								showScreenshotDialog={props.showScreenshotDialog}
								uploadScreenshot={props.uploadScreenshot}
							/>
						</MenuList>
					)}
					PaperProps={{ style: { overflow: 'initial', boxShadow: 'none' } }}
					PopoverProps={{ anchorOrigin: { vertical: 'bottom', horizontal: 'center' } }}
				/>
			))(props.disableScreenshot)}

		</ButtonContainer>
	);
});

export const ImageButton = ({ hasNoPermission, ...props }: IProps) => {
	if (hasNoPermission) {
		return null;
	}

	return (
		<Tooltip title={props.disabled ? 'Sorry, this cannot be edited on a closed item.' : ''}>
			<UpdateImageButton {...props} />
		</Tooltip>
	);
};
