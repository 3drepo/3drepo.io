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

import IconButton from '@material-ui/core/IconButton';

import { ButtonMenu } from '../buttonMenu/buttonMenu.component';
import { PresentationMode } from './presentation.constants';
import { PresentationIcon} from './presentation.styles';
import { PresentationForm } from './presentationForm';

interface IProps {
	isPresenting: boolean;
	joinedPresentation: boolean;
}

export const Presentation: React.FunctionComponent<IProps> = ({ joinedPresentation, isPresenting }) => {
	const mode = isPresenting ? PresentationMode.PRESENTER
			: joinedPresentation ? PresentationMode.PARTICIPANT : PresentationMode.DEFAULT;

	const renderButton = ({ ...props }) => (
		<IconButton {...props} aria-label="Show Presentation mode options" aria-haspopup="true">
			<PresentationIcon fontSize="small" mode={mode} />
		</IconButton>
	);

	const renderMenuContent = ({ ...props }) => <PresentationForm {...props} mode={mode} />;

	return (
		<ButtonMenu
			ripple
			renderButton={renderButton}
			renderContent={renderMenuContent}
			PopoverProps={{
				anchorOrigin: {
					vertical: 'bottom',
					horizontal: 'right',
				},
				transformOrigin: {
					vertical: 'top',
					horizontal: 'right',
				}
			}}
		/>
	);
};
