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
	<svg
		width="15"
		height="15"
		viewBox="0 0 15 17"
		xmlns="http://www.w3.org/2000/svg"
		className={className}
	>
		<path d="M13.2222 2.59229H3.37043C3.16415 2.59229 2.96632 2.67423 2.82046 2.82009C2.6746 2.96595 2.59265 3.16378 2.59265 3.37006V15.8145C2.59265 16.0207 2.6746 16.2186 2.82046 16.3644C2.96632 16.5103 3.16415 16.5922 3.37043 16.5922H13.2222C13.4285 16.5922 13.6264 16.5103 13.7722 16.3644C13.9181 16.2186 14 16.0207 14 15.8145V3.37006C14 3.16378 13.9181 2.96595 13.7722 2.82009C13.6264 2.67423 13.4285 2.59229 13.2222 2.59229ZM12.963 15.5552H3.62968V3.62932H12.963V15.5552Z" />
		<path d="M11.4074 0.777775C11.4074 0.571496 11.3254 0.373666 11.1796 0.227805C11.0337 0.0819439 10.8359 0 10.6296 0H0.777775C0.571496 0 0.373666 0.0819439 0.227805 0.227805C0.0819438 0.373666 0 0.571496 0 0.777775V13.2222C0 13.4285 0.0819438 13.6263 0.227805 13.7721C0.373666 13.918 0.571496 13.9999 0.777775 13.9999H1.03703V1.03703H11.4074V0.777775Z" />
	</svg>
);
