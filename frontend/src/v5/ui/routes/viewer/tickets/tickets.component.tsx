/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import TicketsIcon from '@mui/icons-material/FormatListBulleted';
import { FormattedMessage } from 'react-intl';
import { CardContainer, CardHeader } from '@/v5/ui/components/viewer/cards/card.styles';
import { CardContent } from '@/v5/ui/components/viewer/cards/cardContent.component';

export const Tickets = () => (
	<CardContainer>
		<CardHeader>
			<TicketsIcon fontSize="small" />
			<FormattedMessage id="viewer.cards.ticketsTitle" defaultMessage="Tickets" />
		</CardHeader>
		<CardContent>
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi volutpat, ligula a
			sagittis malesuada, lectus lectus congue tortor, vel molestie enim libero at magna.
			In hac habitasse platea dictumst. Maecenas ut lectus tristique, laoreet enim at,
			vulputate diam. Praesent ipsum nisl, vestibulum condimentum risus luctus, egestas
			feugiat orci. Sed aliquam, ante at lacinia tristique, lorem quam dictum metus, sit
			amet posuere erat massa sed leo. Quisque ornare euismod tortor, id sollicitudin lorem
			dignissim et. Orci varius natoque penatibus et magnis dis parturient montes, nascetur
			ridiculus mus. Mauris interdum pretium tincidunt. Nam interdum elit at urna pretium,
			quis maximus ipsum consequat. Duis in egestas magna. Proin vitae vehicula eros.
			Maecenas ultrices eu libero a molestie. Nam vitae ultrices felis. Vivamus a magna lectus.
			Aliquam volutpat ultricies ipsum, nec aliquet eros rhoncus in. Maecenas vitae bibendum
			arcu. Aenean sit amet ornare lacus, sit amet varius risus. Duis malesuada dui quis
			ante aliquet consectetur. Ut vel arcu ornare, ornare odio eget, lobortis est. Nam
			nibh sem, scelerisque sed dui eget, tristique pellentesque mi. Donec molestie at
			libero at bibendum. Etiam quis mi vitae ligula pellentesque dignissim ut sed justo.
			Duis consectetur, libero id ultrices pharetra, nunc augue efficitur augue, quis lacinia
			nunc mi id nibh. Sed est ipsum, iaculis et metus a, accumsan viverra enim.
			Phasellus ac enim a mauris euismod rutrum. Ut a commodo risus. Pellentesque habitant
			morbi tristique senectus et netus et malesuada fames ac turpis egestas. Proin efficitur
			faucibus feugiat. Vestibulum tincidunt lacus ligula, non porta nisl congue nec. Curabitur
			vel enim congue, sollicitudin sem et, tempus lectus. Nunc vehicula feugiat dui, a ullamcorper
			nisl. Aenean suscipit ultricies lobortis. Mauris sit amet lectus sit amet dui molestie
			faucibus. Aliquam fringilla turpis sem. Sed tempus mi eu sapien pulvinar viverra. Class
			aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
			Etiam nec tempor nibh.
			Nulla tempus turpis id libero malesuada, non sollicitudin nunc laoreet. In in fringilla
			urna. Ut a felis a lorem bibendum tempus vel nec orci. Vivamus ut dolor ut diam interdum
			fermentum. Cras gravida placerat ex eget faucibus. Suspendisse potenti. Proin tincidunt
			aliquam faucibus. Nunc sit amet sapien urna.
			Fusce blandit eleifend urna. Aliquam blandit, metus sed porta posuere, turpis velit mollis
			quam, ac sagittis lacus erat et ex. Donec sollicitudin sapien est, sed rutrum nibh venenatis
			nec. Duis et rutrum ipsum. Quisque eget lorem ornare, blandit ex sit amet, pulvinar velit.
			Integer ipsum tellus, tincidunt sed leo at, iaculis pretium purus. Etiam a molestie dui.
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam venenatis quis mi non efficitur.
			Donec malesuada maximus sapien ut fermentum. Nulla porttitor aliquet porttitor. Quisque interdum
			mauris felis, sit amet luctus mi ultrices id. Maecenas rhoncus magna nec massa auctor commodo.
			Maecenas posuere elit quis nisl iaculis fermentum. Proin aliquet quam et blandit sollicitudin.
			In sit amet hendrerit ipsum.
		</CardContent>
	</CardContainer>
);
