/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { useEffect, useState } from 'react';
import { validateImgSrc } from '@controls/formImage/image.helper';
import {
	ActionsList,
	ActionsSide,
	Container,
	PropertyName,
	Asterisk,
} from './basicTicketImage.styles';
import { TicketImageActionContext } from './ticketImageAction/ticketImageActionContext';
import { TicketImageDisplayer } from './ticketImageDisplayer/ticketImageDisplayer.component';

type BasicTicketImageProps = {
	defaultValue?: string,
	viewpoint?: any,
	title: string,
	className?: string,
	onChange?: ({ imgSrc, viewpoint }) => void,
	children: any,
	required?: boolean,
};
export const BasicTicketImage = ({
	children,
	defaultValue,
	viewpoint:
	inputViewpoint,
	title,
	className,
	onChange,
	required,
}: BasicTicketImageProps) => {
	const [viewpoint, setViewpoint] = useState(inputViewpoint);
	const [imgSrc, setImgSrc] = useState(defaultValue);
	const [imgIsInvalid, setImgIsInvalid] = useState(false);

	const deleteImg = () => setImgSrc(null);

	const uploadImgSrc = (newImgSrc) => {
		setImgSrc(newImgSrc);
		setImgIsInvalid(false);
	};

	const handleInvalidUploadImgSrc = () => {
		deleteImg();
		setImgIsInvalid(true);
	};

	const uploadImgFile = (imgFile) => {
		if (!imgFile) {
			deleteImg();
		} else {
			const reader = new FileReader();
			reader.onloadend = () => validateImgSrc(reader.result, uploadImgSrc, handleInvalidUploadImgSrc);
			reader.readAsDataURL(imgFile);
		}
	};

	const contextValue = {
		imgSrc,
		setImgSrc: uploadImgSrc,
		setImgFile: uploadImgFile,
		viewpoint,
		setViewpoint,
	};

	useEffect(() => { onChange?.({ imgSrc, viewpoint }); }, [imgSrc, viewpoint]);
	useEffect(() => { setImgSrc(defaultValue); }, [defaultValue]);

	return (
		<Container className={className}>
			<TicketImageActionContext.Provider value={contextValue}>
				<ActionsSide>
					<PropertyName>
						{title}{required && <Asterisk />}
					</PropertyName>
					<ActionsList>
						{children}
					</ActionsList>
				</ActionsSide>
				<TicketImageDisplayer imgIsInvalid={imgIsInvalid} />
			</TicketImageActionContext.Provider>
		</Container>
	);
};
