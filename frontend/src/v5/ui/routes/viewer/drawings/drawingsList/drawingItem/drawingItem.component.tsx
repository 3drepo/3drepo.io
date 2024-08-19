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

import { IDrawing } from '@/v5/store/drawings/drawings.types';
import {
	Container,
	Title,
	DrawingsCalibrationButton,
	MainBody,
	ImageContainer,
	Property,
	PropertyValue,
	Description,
	BottomLine,
	InfoContainer,
	BreakingLine,
	SkeletonText,
} from './drawingItem.styles';
import { FormattedMessage } from 'react-intl';
import { DrawingRevisionsHooksSelectors } from '@/v5/services/selectorsHooks';
import { formatDateTime } from '@/v5/helpers/intl.helper';
import { formatMessage } from '@/v5/services/intl';
import { useSearchParam } from '@/v5/ui/routes/useSearchParam';

const STATUS_CODE_TEXT = formatMessage({ id: 'drawings.list.item.statusCode', defaultMessage: 'Status code' });
const REVISION_CODE_TEXT = formatMessage({ id: 'drawings.list.item.revisionCode', defaultMessage: 'Revision code' });

type DrawingItemProps = {
	drawing: IDrawing;
	onClick: React.MouseEventHandler<HTMLDivElement>;
};
export const DrawingItem = ({ drawing, onClick }: DrawingItemProps) => {
	const [latestRevision] = DrawingRevisionsHooksSelectors.selectRevisions(drawing._id);
	const { calibration, name, drawingNumber, lastUpdated, desc } = drawing;
	const { statusCode, revisionCode } = latestRevision || {};
	const areStatsPending = !revisionCode;
	const [selectedDrawingId] = useSearchParam('drawingId');

	const LoadingCodes = () => (
		<>
			<BreakingLine>
				<Property>
					{STATUS_CODE_TEXT}: <SkeletonText width={120} />
				</Property>
			</BreakingLine>
			<BreakingLine>
				<Property>
					{REVISION_CODE_TEXT}: <SkeletonText width={120} />
				</Property>
			</BreakingLine>
		</>
	);
	
	const LoadedCodes = () => (
		<>
			{statusCode && (
				<BreakingLine>
					<Property>
						{STATUS_CODE_TEXT}: <PropertyValue>{statusCode}</PropertyValue>
					</Property>
				</BreakingLine>
			)}
			<BreakingLine>
				<Property>
					{REVISION_CODE_TEXT}: <PropertyValue>{revisionCode}</PropertyValue>
				</Property>
			</BreakingLine>
		</>
	);

	return (
		<Container onClick={onClick} key={drawing._id} $selected={drawing._id === selectedDrawingId}>
			<MainBody>
				<ImageContainer>
					<img src="https://placedog.net/73/73" />
				</ImageContainer>
				<InfoContainer>
					<BreakingLine>
						<Property>{drawingNumber}</Property>
					</BreakingLine>
					<BreakingLine>
						<Title>{name}</Title>
					</BreakingLine>
					{areStatsPending ? <LoadingCodes /> : <LoadedCodes />}
					<Description>{desc}</Description>
				</InfoContainer>
			</MainBody>
			<BottomLine>
				<BreakingLine>
					<Property>
						<FormattedMessage id="drawings.list.item.lastUpdated" defaultMessage="Last updated" />:
						<PropertyValue>&nbsp;{formatDateTime(lastUpdated)}</PropertyValue>
					</Property>
				</BreakingLine>
				<DrawingsCalibrationButton
					onClick={() => {}}
					calibration={calibration}
				/>
			</BottomLine>
		</Container>
	);
};
