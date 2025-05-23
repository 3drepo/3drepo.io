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
import { DrawingsHooksSelectors, TicketsCardHooksSelectors } from '@/v5/services/selectorsHooks';
import { useParams } from 'react-router-dom';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';
import { Pin2D } from './pin2D/pin2D.component';
import { compact } from 'lodash';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';

type PinsLayerProps = { scale: number, height: number, width: number };
export const PinsLayer = ({ scale, height, width }: PinsLayerProps) => {
	const [drawingId] = useSearchParam('drawingId');
	const { containerOrFederation } = useParams<ViewerParams>();
	const pins = compact(TicketsCardHooksSelectors.selectTicketPins().concat(TicketsCardHooksSelectors.selectNewTicketPins()));
	const transform3DTo2D = DrawingsHooksSelectors.selectTransform3DTo2D(drawingId, containerOrFederation);
	const verticalRange =  DrawingsHooksSelectors.selectCalibrationVertical(drawingId, containerOrFederation);

	if (!transform3DTo2D) return null;

	const mapPin3DTo2D = (pin) => {
		const { x, y } = transform3DTo2D(pin.position);
		return { ...pin, position: [x, y], vertical: pin.position[1] };
	};

	const isInVerticalRange = (vertical: number) => verticalRange[0] <= vertical &&  vertical <= verticalRange[1];
	const isInRange = (val, limit) => val >= 0 && val <= limit; 
	const pinIsInRange = ({ position, vertical }) => 
		isInRange(position[0], width) && isInRange(position[1], height) && isInVerticalRange(vertical);

	const pins2D = pins.map(mapPin3DTo2D).filter(pinIsInRange);

	return (
		<>
			{pins2D.map((pin) => <Pin2D key={pin.id} scale={scale} {...pin} />)}
		</>
	);
};