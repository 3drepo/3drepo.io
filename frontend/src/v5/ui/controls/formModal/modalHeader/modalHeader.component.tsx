/**
 *  Copyright (C) 2023 3D Repo Ltd
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
import { DetailedHTMLProps, FormHTMLAttributes } from 'react';
import CloseIcon from '@assets/icons/outlined/close-outlined.svg';
import { Title, Header, CloseButton, Subtitle } from './modalHeader.styles';

export interface IModalHeader extends Omit<DetailedHTMLProps<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>, 'ref'> {
	onClickClose: () => void;
	title: any;
	subtitle?: string;
	disableClosing?: boolean;
	contrastColor?: boolean;
}

export const ModalHeader = ({
	onClickClose,
	title,
	subtitle,
	className,
	disableClosing = false,
	contrastColor,
}: IModalHeader) => (
	<Header className={className} $contrastColor={contrastColor}>
		<div>
			<Title>
				{title}
			</Title>
			{subtitle && <Subtitle>{subtitle}</Subtitle>}
		</div>
		<CloseButton aria-label="Close dialog" onClick={onClickClose} disabled={disableClosing}>
			<CloseIcon />
		</CloseButton>
	</Header>
);
