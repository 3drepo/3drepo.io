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

import { isV5 } from '@/v4/helpers/isV5';
import { VIEWER_ROUTE } from '@/v5/ui/routes/routes.constants';
import { generatePath } from 'react-router-dom';
import OpenInBrowser from '@mui/icons-material/OpenInBrowser';
import { memo } from 'react';

import { ROUTES } from '../../../constants/routes';
import { TooltipButton } from '../../teamspaces/components/tooltipButton/tooltipButton.component';
import { ShowModelButtonContainer } from './openInViewerButton.styles';

interface IProps {
	className?: string;
	teamspace: string;
	model: string;
	query?: string;
	history?: any;
	preview?: boolean;
	location?: any;
}

export const OpenInViewerButton = memo((props: IProps) => {
	const handleGoToModel = (event) => {
		event.stopPropagation();
		const { teamspace, model, query, location } = props;
		let targetUrl = window.location.origin;
		if (isV5()) {
			const project = location.pathname.split("/")[4];
			const viewerParams = {
				containerOrFederation: model,
				teamspace,
				project,
			};
			targetUrl += `${generatePath(VIEWER_ROUTE, viewerParams)}?${query || ''}`;
		} else {
			targetUrl += `${ROUTES.VIEWER}/${teamspace}/${model}?${query || ''}`;
		}
		window.open(targetUrl, '_blank', 'noopener');
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
