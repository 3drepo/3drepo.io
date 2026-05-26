/**
 *  Copyright (C) 2025 3D Repo Ltd
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

import { AlertModalProps } from '@components/shared/modalsDispatcher/templates/alertModal/alertModal.types';
import { DeleteModalProps } from '@components/shared/modalsDispatcher/templates/deleteModal/deleteModal.types';
import { ImagesModalProps } from '@components/shared/modalsDispatcher/templates/imagesModal/imagesModal.types';
import { InfoModalProps } from '@components/shared/modalsDispatcher/templates/infoModal/infoModal.types';
import { ShareModalProps } from '@components/shared/modalsDispatcher/templates/shareModal/shareModal.types';
import { WarningModalProps } from '@components/shared/modalsDispatcher/templates/warningModal/warningModal.types';
import React from 'react';

export type FunctionComponent = ((props) => JSX.Element);

export interface IDialogConfig {
	id: string;
	modalType?: ModalType | FunctionComponent;
	props: any;
	syncProps: any;
}

export interface IDialogState {
	dialogs: IDialogConfig[];
}

export type ModalType = 'alert' | 'warning' | 'delete' | 'info' | 'share' | 'images';

type ModalProps = {
	['alert']: AlertModalProps;
	['warning']: WarningModalProps;
	['delete']: DeleteModalProps;
	['info']: InfoModalProps;
	['share']: ShareModalProps;
	['images']: ImagesModalProps;
};
export type ExtractModalProps<T> = T extends ModalType ? ModalProps[T] : T extends React.FC ? React.ComponentProps<T> : any;

