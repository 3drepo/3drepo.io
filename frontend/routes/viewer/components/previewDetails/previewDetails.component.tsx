/**
 *  Copyright (C) 2017 3D Repo Ltd
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

import * as React from 'react';

import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { renderWhenTrue } from '../../../../helpers/rendering';
import { PreviewItemInfo } from '../previewItemInfo/previewItemInfo.component';
import { RoleIndicator } from '../previewListItem/previewListItem.styles';
import { Container, Collapsable, Details, Summary, CollapsableContent } from './previewDetails.styles';

interface IProps {
	roleColor: string;
	name: string;
	count: number;
	author: string;
	createdDate: string;
	StatusIconComponent: any;
	statusColor: string;
}

export class PreviewDetails extends React.PureComponent<IProps, any> {
	public renderNameWithCounter = renderWhenTrue(() =>
		<Typography>{`${this.props.count}. ${this.props.name}`}</Typography>
	);

	public renderName = renderWhenTrue(() => <Typography>{this.props.name}</Typography>);

	public render() {
		const { roleColor, count, author, createdDate, children, StatusIconComponent, statusColor } = this.props;

		return (
			<Container>
				<Collapsable>
					<Summary expandIcon={<ExpandMoreIcon />}>
						<RoleIndicator color={roleColor} />
						{this.renderNameWithCounter(count)}
						{this.renderName(!count)}
					</Summary>
					<Details>
						<PreviewItemInfo
							author={author}
							createdAt={createdDate}
							StatusIconComponent={StatusIconComponent}
							statusColor={statusColor}
						/>
						<CollapsableContent>
							{children}
						</CollapsableContent>
					</Details>
				</Collapsable>
			</Container>
		);
	}
}
