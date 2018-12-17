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

import { PreviewItemInfo } from './../previewItemInfo/previewItemInfo.component';
import { Container, Collapsable, Details, Summary, MoreIcon, CollapsableContent } from './previewDetails.styles';
import { RoleIndicator } from './../previewListItem/previewListItem.styles';

interface IProps {
	roleColor: string;
	name: string;
	count: number;
	author: string;
	createdAt: string;
	StatusIconComponent: any;
	statusColor: string;
}

export class PreviewDetails extends React.PureComponent<IProps, any> {
	public render() {
		const { roleColor, name, count, author, createdAt, children, StatusIconComponent, statusColor } = this.props;

		return (
			<Container>
				<Collapsable>
					<Summary expandIcon={<MoreIcon><ExpandMoreIcon /></MoreIcon>}>
						<RoleIndicator color={roleColor} />
						<Typography>{`${count}. ${name}`}</Typography>
					</Summary>
					<Details>
						<PreviewItemInfo
							author={author}
							createdAt={createdAt}
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
