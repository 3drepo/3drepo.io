/**
 *  Copyright (C) 2019 3D Repo Ltd
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

import OpenInBrowser from '@material-ui/icons/OpenInBrowser';
import React, { memo } from 'react';

import { ROUTES } from '../../../constants/routes';
import { TooltipButton } from '../../teamspaces/components/tooltipButton/tooltipButton.component';
import { ShowModelButtonContainer } from './openInViewerButton.styles';

interface IProps {
	className?: string;
	teamspace: string;
	model: string;
	query?: string;
	history: any;
	preview?: boolean;
}

export const OpenInViewerButton = memo((props: IProps) => {
	const handleGoToModel = (event) => {
		event.stopPropagation();
		const { teamspace, model, query } = props;
		window.open(`${window.location.origin}${ROUTES.VIEWER}/${teamspace}/${model}?${query || ''}`, '_blank', 'noopener');
	};

	return (
		<ShowModelButtonContainer preview={props.preview} className={props.className}>
			<TooltipButton
				Icon={OpenInBrowser}
				label="View on model"
				action={handleGoToModel}
			/>
		</ShowModelButtonContainer>
	);
});
