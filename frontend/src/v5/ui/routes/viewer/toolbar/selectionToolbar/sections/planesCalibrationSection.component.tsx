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

import { PlaneType } from '@/v5/ui/routes/dashboard/projects/calibration/calibration.types';
import { LozengeButton, Section } from '../selectionToolbar.styles';
import { formatMessage } from '@/v5/services/intl';
import { FormattedMessage } from 'react-intl';
import AlignIcon from '@assets/icons/viewer/align.svg';
import { ToolbarButton } from '../../buttons/toolbarButton.component';
import { VerticalRange } from '../../buttons/toolbarButtons.component';
import { useContext } from 'react';
import { CalibrationContext } from '@/v5/ui/routes/dashboard/projects/calibration/calibrationContext';

type ISection = {
	hidden: boolean;
};

export const PlanesCalibrationSection = ({ hidden }: ISection) => {
	const { selectedPlane, setSelectedPlane, isAlignPlaneActive, setIsAlignPlaneActive } = useContext(CalibrationContext);
	return (
		<Section hidden={hidden}>
			<LozengeButton
				onClick={() => setSelectedPlane(PlaneType.LOWER) }
				selected={selectedPlane === PlaneType.LOWER}
				hidden={hidden}
			>
				<FormattedMessage id="viewer.toolbar.icon.lowerPlane" defaultMessage="Bottom Plane" />
			</LozengeButton>
			<LozengeButton
				onClick={() => setSelectedPlane(PlaneType.UPPER) }
				selected={selectedPlane === PlaneType.UPPER}
				hidden={hidden}
			>
				<FormattedMessage id="viewer.toolbar.icon.upperPlane" defaultMessage="Top Plane" />
			</LozengeButton>
			<VerticalRange hidden={hidden} />
			<ToolbarButton
				Icon={AlignIcon}
				onClick={() => setIsAlignPlaneActive(!isAlignPlaneActive)}
				selected={isAlignPlaneActive}
				title={formatMessage({ id: 'viewer.toolbar.icon.alignFloorToSurface', defaultMessage: 'Align Floor To Surface' })}
				hidden={hidden}
			/>
		</Section>
	);
};