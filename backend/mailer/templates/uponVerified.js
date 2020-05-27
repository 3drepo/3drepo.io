/**
 *
 *  Copyright (C) 2014 3D Repo Ltd
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
"use strict";
const { ctaButton,  emailContainer } = require("./basicEmailTemplate");

const html = () => emailContainer(`
    <img align="left" alt="" src="https://mcusercontent.com/fa2aa09169a7d4049287e5bb3/images/41613b1e-c170-43dd-91c3-80a1d0c8276f.jpg" width="100" style="max-width:100px; padding-bottom: 0; display: block !important; vertical-align: bottom; margin-bottom: 16px" class="mcnImage">
    <img align="center" alt="" src="https://mcusercontent.com/fa2aa09169a7d4049287e5bb3/images/79659448-6044-4810-aa0d-0a935a0013aa.jpg" width="564" style="max-width: 1920px; padding-bottom: 0px; vertical-align: bottom; display: inline !important; border: 1px none; border-radius: 0%;" class="mcnImage">
    <div style="margin: 27px 0px 0px 0px;;color: #000000;font-family: Roboto, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif;font-size: 30px;font-style: normal;font-weight: bold;text-align: center;">
         Welcome to 3D Repo
    </div>
    <div style="display: block; width: 100%; text-align: center; margin: 27px 23px;">
        Now you have access to all the core functionality you need for better
        project collaboration. Here are a few resources to help you get started:
	</div>

	<div class="mcnImageContent" valign="top" style="padding-top: 0;padding-bottom: 0;height: 176px;display: block;background: url(https://mcusercontent.com/fa2aa09169a7d4049287e5bb3/images/d5fe4ed0-026b-4c2a-97f4-a35e2d9f3608.jpg);width: 564px;background-repeat: no-repeat;background-size: 564px 176px;">
		<a href="https://3drepo.com/support/#Video_Tutorials" style="display: inline-block;width: 123px;height: 150px;margin-left: 12px;margin-top: 9px;"></a>
		<a href="https://3drepo.com/support/#User_Guides" style="display: inline-block;width: 123px;height: 150px;margin-left: 12px;margin-top: 9px;"></a>
		<a href="https://3drepo.com/support/#FAQ" style="display: inline-block;width: 123px;height: 150px;margin-left: 12px;margin-top: 9px;"></a>
		<a href="https://3drepo.com/support/#BIM_Forensics" style="display: inline-block; width: 123px;height: 150px; margin-left: 12px;margin-top: 9px;"></a>
	</div>
	${ctaButton("Support Centre", "https://3drepo.com/support/", 10)}

	<table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;">
  		<tbody class="mcnDividerBlockOuter">
        	<tr>
            	<td class="mcnDividerBlockInner" style="min-width: 100%; padding: 0px 0px 32px 0px;">
                	<table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top: 1px solid #D5D2D2;">
						<tbody><tr><td><span></span></td></tr></tbody>
					</table>
<!--
                <td class="mcnDividerBlockInner" style="padding: 0px 0px 32px 0px;">
                <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
-->
				</td>
			</tr>
		</tbody>
	</table>

	<div class="mcnImageContent" valign="top" style="padding-top: 0;padding-bottom: 0;height: 240px;display: block;background: url(https://mcusercontent.com/fa2aa09169a7d4049287e5bb3/images/d8391a96-dd34-4984-8b5d-4fe58fe43844.jpg);width: 564px;background-repeat: no-repeat;background-size: 564px 240px;">
		<a href="https://3drepo.github.io/3drepo.io/" style="
		display: inline-block;
		width: 269px;
		height: 227px;
		margin-left: 6px;
		margin-top: 7px;
		"></a>
		<a href="https://3drepo.github.io/3drepo.io/frontend/classes/unityutil.html" style="display: inline-block; width: 270px; height: 227px; margin-left: 9px;margin-top: 7px;"></a>
	</div>
	${ctaButton("API Documentation", "https://3drepo.com/api/", 10)}
    `);

module.exports =  {
	html: html,
	subject: "Welcome to 3D Repo! You are now verified."
};
