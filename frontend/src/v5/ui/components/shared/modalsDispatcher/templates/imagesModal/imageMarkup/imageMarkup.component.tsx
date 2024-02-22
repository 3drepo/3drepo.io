/**
 *  Copyright (C) 2024 3D Repo Ltd
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
import { useForm, FormProvider } from 'react-hook-form';
import { MarkupToolbar } from './markupToolbar/markupToolbar.component';
import { FONT_SIZE, IMarkupForm, STROKE_WIDTH } from './imageMarkup.types';
import { Container, Image, ImageContainer } from './imageMarkup.styles';
import { MarkupToolbarContainer } from '../imagesModal.styles';

type ImageMarkupProps = {
	image: string,
	onSave: (img) => void;
	onClose: () => void;
};
export const ImageMarkup = ({ image, onSave, onClose }: ImageMarkupProps) => {
	const formData = useForm<IMarkupForm>({
		defaultValues: {
			sourceImage: image,
			color: '',
			strokeWidth: STROKE_WIDTH.M,
			fontSize: FONT_SIZE.M,
			mode: null,
			activeShape: null,
			stage: {
				height: 0,
				width: 0,
			},
			container: {
				// height: INIT_DIALOG_HEIGHT,
				// width: MIN_DIALOG_WIDTH,
			},
		},
	});

	return (
		<Container>
			<FormProvider {...formData}>
				<ImageContainer>
					<Image src={image} />
				</ImageContainer>
				<MarkupToolbarContainer>
					<MarkupToolbar onSave={() => onSave(null)} onClose={onClose} />
				</MarkupToolbarContainer>
			</FormProvider>
		</Container>
	);
};
