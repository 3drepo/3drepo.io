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
import { useParams } from 'react-router-dom';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { CardContext } from '@components/viewer/cards/cardContext.component';
import { useContext, useEffect, useState } from 'react';
import { getImageUrl, stripBase64Prefix } from '@controls/fileUploader/imageFile.helper';
import { useFormContext } from 'react-hook-form';
import { PropertyProps } from './properties.types';
import { TicketImage } from './basicTicketImage/ticketImage/ticketImage.component';

export const ImageProperty = ({
	property: { name: title, readOnly, required },
	name,
	defaultValue,
	onBlur,
	...props
}: PropertyProps) => {
	const { setValue } = useFormContext();
	const [img, setImg] = useState('');
	const { props: { ticketId } } = useContext(CardContext);
	const { teamspace, project, containerOrFederation } = useParams();
	const isFederation = modelIsFederation(containerOrFederation);

	const getResourceUrl = () => {
		if (!defaultValue) return undefined;
		const modelType = isFederation ? 'federations' : 'containers';
		return getImageUrl(
			`teamspaces/${teamspace}/projects/${project}/${modelType}/${containerOrFederation}/tickets/${ticketId}/resources/${defaultValue}`,
		);
	};

	const handleImageChange = ({ imgSrc = '' }) => {
		if (imgSrc === img || imgSrc === getResourceUrl()) return;
		const formattedImgSrc = stripBase64Prefix(imgSrc);
		setValue(name, formattedImgSrc, { shouldValidate: true, shouldDirty: true });
		setImg(formattedImgSrc);
	};

	useEffect(() => { onBlur?.(); }, [img]);

	return (
		<TicketImage
			onChange={handleImageChange}
			title={title}
			disabled={readOnly}
			required={required}
			defaultValue={getResourceUrl()}
			{...props}
		/>
	);
};
