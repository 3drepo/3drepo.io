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
import { useParams } from 'react-router';
import { ViewerParams } from '@/v5/ui/routes/routes.constants';
import { getDrawingThumbnailSrc } from '@/v5/store/drawings/drawings.helpers';
import { combineSubscriptions } from '@/v5/services/realtime/realtime.service';
import { enableRealtimeDrawingRemoved, enableRealtimeDrawingUpdate } from '@/v5/services/realtime/drawings.events';
import { enableRealtimeDrawingRevisionUpdate, enableRealtimeDrawingNewRevision } from '@/v5/services/realtime/drawingRevision.events';
import { useEffect, useState } from 'react';
import { deleteAuthUrlFromCache, downloadAuthUrl } from '@components/authenticatedResource/authenticatedResource.hooks';
import { Thumbnail } from '@controls/thumbnail/thumbnail.component';
import { Tooltip } from '@mui/material';

const STATUS_CODE_TEXT = formatMessage({ id: 'drawings.list.item.statusCode', defaultMessage: 'Status code' });
const REVISION_CODE_TEXT = formatMessage({ id: 'drawings.list.item.revisionCode', defaultMessage: 'Revision code' });

type DrawingItemProps = {
	drawing: IDrawing;
	onClick: React.MouseEventHandler<HTMLDivElement>;
};
export const DrawingItem = ({ drawing, onClick }: DrawingItemProps) => {
	const { teamspace, project } = useParams<ViewerParams>();
	const latestRevision = DrawingRevisionsHooksSelectors.selectLatestActiveRevision(drawing._id);
	const { calibration, name, number, lastUpdated, desc } = drawing;
	const { statusCode, revCode } = latestRevision || {};
	const areStatsPending = !revCode;
	const [selectedDrawingId] = useSearchParam('drawingId');
	const [thumbnail, setThumbnail] = useState('');
	const thumbnailSrc = getDrawingThumbnailSrc(teamspace, project, drawing._id);

	useEffect(() => {
		return combineSubscriptions(
			enableRealtimeDrawingRemoved(teamspace, project, drawing._id),
			enableRealtimeDrawingUpdate(teamspace, project, drawing._id),
			enableRealtimeDrawingRevisionUpdate(teamspace, project, drawing._id),
			enableRealtimeDrawingNewRevision(teamspace, project, drawing._id),
		);
	}, [drawing._id]);

	useEffect(() => {
		downloadAuthUrl(thumbnailSrc)
			.then(setThumbnail)
			.catch(() => setThumbnail(''));
		return () => { deleteAuthUrlFromCache(thumbnailSrc); };
	}, [latestRevision?._id]);

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
					{REVISION_CODE_TEXT}: <PropertyValue>{revCode}</PropertyValue>
				</Property>
			</BreakingLine>
		</>
	);

	return (
		<Container onClick={onClick} key={drawing._id} $selected={drawing._id === selectedDrawingId}>
			<MainBody>
				<ImageContainer>
					<Thumbnail src={thumbnail} />
				</ImageContainer>
				<InfoContainer>
					<BreakingLine>
						<Property>{number}</Property>
					</BreakingLine>
					<BreakingLine>
						<Tooltip title={name}>
							<Title>{name}</Title>
						</Tooltip>
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
