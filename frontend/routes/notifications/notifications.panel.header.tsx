/**
 *  Copyright (C) 2018 3D Repo Ltd
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
import { ItemLabel } from "../components/components.styles";
import { NotificationsPanelHeaderContainer, NotificationsPanelItem } from "./notifications.panel.styles";
import * as React from "react";

export class NotificationsPanelHeader extends React.PureComponent<any, any> {
	public render = () => {
		const { labelLeft, labelRight, style } = this.props;
		return (<NotificationsPanelItem style={style}>
				<NotificationsPanelHeaderContainer>
							<ItemLabel>
								{labelLeft}
							</ItemLabel>
							<ItemLabel>
								{labelRight}
							</ItemLabel>
				</NotificationsPanelHeaderContainer>
			</NotificationsPanelItem>);
	}
}
