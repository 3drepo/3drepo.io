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
import { DRAWINGS_ROUTE, ViewerParams } from '../../../routes.constants';
import { EmptyPageView } from '@components/shared/emptyPageView/emptyPageView.styles';
import { Button } from '@controls/button';
import { Link } from 'react-router-dom';
import { useSearchParam } from '../../../useSearchParam';
import { CalibrationContextComponent } from './calibrationContext';
import { CalibrationHeader } from './calibrationHeader/calibrationHeader.component';
import { CalibrationStep } from './calibrationStep/calibrationStep.component';
import { Container } from './calibration.styles';

export const Calibration = () => {
	const { teamspace, project } = useParams<ViewerParams>();
	const [drawing] = useSearchParam('calibrationDrawing');

	const selectedDrawing = DrawingsHooksSelectors.selectDrawingById(drawing);
	const { isListPending: containersArePending } = useContainersData();
	const { isListPending: federationsArePending } = useFederationsData();
	const isLoadingModels = containersArePending || federationsArePending;
	const isLoadingDrawings = DrawingsHooksSelectors.selectIsListPending();

	if (isLoadingModels || isLoadingDrawings) return (<Loader />);

	if (!selectedDrawing) {
		return (
			<EmptyPageView>
				<FormattedMessage
					id="calibration.invalidDrawing"
					defaultMessage="The selected drawing was not found. Please, go back to the drawings list and select the drawing to calibrate from there."
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

	return (
		<CalibrationContextComponent>
			<Container>
				<CalibrationHeader />
				<CalibrationStep />
			</Container>
		</CalibrationContextComponent>
	);
};
