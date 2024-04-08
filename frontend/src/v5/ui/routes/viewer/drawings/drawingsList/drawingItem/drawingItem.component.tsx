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
import { Drawing, Title, DrawingsCalibrationButton, MainBody, ImageContainer, GrayText, BlueText, Description, BottomLine, InfoContainer, BreakingLine } from './drawingtem.styles';
import { FormattedMessage } from 'react-intl';
import { formatShortDateTime } from '@/v5/helpers/intl.helper';

type DrawingItemProps = {
	drawing: IDrawing;
	onClick: React.MouseEventHandler<HTMLDivElement>;
};

export const DrawingItem = ({ drawing, onClick }: DrawingItemProps) => {
	const { calibration, name, drawingNumber, lastUpdated, desc } = drawing;
	// TODO - use latest revision
	const { statusCode, revisionCode } = { statusCode: Math.random() > .5 ? 'st-code' : null, revisionCode: 'rev-code' };

	return (
		<Drawing onClick={onClick} key={drawing._id} >
			<MainBody>
				<ImageContainer>
					<img src="https://placedog.net/73/73" />
				</ImageContainer>
				<InfoContainer>
					<BreakingLine>
						<GrayText>{drawingNumber}</GrayText>
					</BreakingLine>
					<BreakingLine>
						<Title>{name}</Title>
					</BreakingLine>
					{statusCode && (
						<BreakingLine>
							<GrayText>
								<FormattedMessage id="drawings.list.item.statusCode" defaultMessage="Status code" />:
							</GrayText>
							<BlueText>&nbsp;{statusCode}</BlueText>
						</BreakingLine>
					)}
					<BreakingLine>
						<GrayText>
							<FormattedMessage id="drawings.list.item.revisionCode" defaultMessage="Revision code" />:
						</GrayText>
						<BlueText>&nbsp;{revisionCode}</BlueText>
					</BreakingLine>
					<Description>
						{desc}
					</Description>
				</InfoContainer>
			</MainBody>
			<BottomLine>
				<BreakingLine>
					<GrayText>
						<FormattedMessage id="drawings.list.item.lastUpdated" defaultMessage="Last updated" />:
					</GrayText>
					<BlueText>
						&nbsp;{formatShortDateTime(lastUpdated)}
					</BlueText>
				</BreakingLine>
				<DrawingsCalibrationButton
					onClick={() => {}}
					calibration={calibration}
				/>
			</BottomLine>
		</Drawing>
	);
};
