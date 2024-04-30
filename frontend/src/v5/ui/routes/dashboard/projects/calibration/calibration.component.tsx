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

import { generatePath, useParams } from 'react-router';
import { Loader } from '@/v4/routes/components/loader/loader.component';
import { DrawingsHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormattedMessage } from 'react-intl';
import { useContainersData } from '../containers/containers.hooks';
import { useFederationsData } from '../federations/federations.hooks';
import { CalibrationParams, DRAWINGS_ROUTE } from '../../../routes.constants';
import { EmptyPageView } from '@components/shared/emptyPageView/emptyPageView.styles';
import { CalibrationStep } from './calibrationStep/calibrationStep.component';
import { Button } from '@controls/button';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { DrawingsActionsDispatchers } from '@/v5/services/actionsDispatchers';

export const Calibration = () => {
	const { teamspace, project, drawing } = useParams<CalibrationParams>();

	const selectedDrawing = DrawingsHooksSelectors.selectDrawingById(drawing);
	const { isListPending: containersArePending, containers } = useContainersData();
	const { isListPending: federationsArePending, federations } = useFederationsData();
	const isLoadingModels = containersArePending || federationsArePending;
	const isLoadingDrawings = DrawingsHooksSelectors.selectIsListPending();
	const hasModels = !![...containers, ...federations].length;

	useEffect(() => {
		if (selectedDrawing || !teamspace || !project) return;
		DrawingsActionsDispatchers.fetchDrawings(teamspace, project);
	}, [teamspace, project]);

	if (isLoadingModels || isLoadingDrawings) return (<Loader />);

	if (!hasModels) {
		return (
			<EmptyPageView>
				<FormattedMessage
					id="calibration.emptyModels"
					defaultMessage="This project is empty. Please, proceed to create a container or a federation to access this content."
				/>
			</EmptyPageView>
		);
	}

	if (!selectedDrawing) {
		return (
			<EmptyPageView>
				<FormattedMessage
					id="calibration.invalidDrawing"
					defaultMessage="The selected drawing was not found. Please, go back to the drawings list select the drawing to calibrate from there."
				/>
				<br />
				<Button variant="contained">
					<Link to={generatePath(DRAWINGS_ROUTE, { teamspace, project })}>
						<FormattedMessage
							id="calibration.invalidDrawing.goToDrawings"
							defaultMessage="Open drawings"
						/>
					</Link>
				</Button>
			</EmptyPageView>
		);
	}

	return (<CalibrationStep />);
};
