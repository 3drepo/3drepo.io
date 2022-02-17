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

import React from 'react';

type IProps = {
	className?: any;
};

export default ({ className }: IProps) => (
	<svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
		<path d="M12.832 3.71953C12.9293 3.64082 13.074 3.71445 13.074 3.83887V9.03125C13.074 9.7041 12.5376 10.25 11.8764 10.25H1.4976C0.836453 10.25 0.300049 9.7041 0.300049 9.03125V3.84141C0.300049 3.71445 0.442258 3.64336 0.542055 3.72207C1.10091 4.16387 1.8419 4.725 4.3867 6.60645C4.91313 6.99746 5.80131 7.82012 6.68701 7.81504C7.57769 7.82266 8.48334 6.98223 8.9898 6.60645C11.5346 4.725 12.2731 4.16133 12.832 3.71953ZM6.68701 7C7.26582 7.01016 8.09912 6.25859 8.51827 5.94883C11.829 3.50371 12.081 3.29043 12.8444 2.68105C12.9891 2.5668 13.074 2.38906 13.074 2.20117V1.71875C13.074 1.0459 12.5376 0.5 11.8764 0.5H1.4976C0.836453 0.5 0.300049 1.0459 0.300049 1.71875V2.20117C0.300049 2.38906 0.384876 2.56426 0.52958 2.68105C1.29302 3.28789 1.54501 3.50371 4.85575 5.94883C5.27489 6.25859 6.10819 7.01016 6.68701 7Z" fill="#6B778C" />
	</svg>
);
