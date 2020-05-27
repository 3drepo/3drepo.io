/**
 *  Copyright (C) 2020 3D Repo Ltd
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

const logoImage = (showLogo) => showLogo ? "<img align=\"center\" alt=\"\" src=\"https://gallery.mailchimp.com/fa2aa09169a7d4049287e5bb3/images/7d31fd95-177f-47a2-b76a-d0935a88f7b6.png\" width=\"200\" style=\"max-width: 200px; padding-bottom: 0px; vertical-align: bottom; display: inline !important; border-radius: 0%;\" class=\"mcnImage\">" : "";

const emailContainer = (showLogo) => (content) => `<!doctype html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
        <!-- NAME: FOLLOW UP -->
        <!--[if gte mso 15]>
        <xml>
            <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
		<meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>*|MC:SUBJECT|*</title>

	<style type="text/css">

		.templateContainer {
			width: 100%;
			max-width:600px !important;
			border-spacing: 0px;
		}

		.templateHeader {
			min-height: 65px;
			padding: 9px 9px 34px 9px;
		}

		.content {
			background-color: white;
			padding: 24px 18px;
		}

		.iconLink {
			display: inline-block;
			margin-right: 12px;
			margin-left: 12px;
		}

		.contactInfo {
			text-align: center;
			font-size: 12px;
			line-height: 18px;
			padding: 0px 18px 9px;
			color: #8A8A8A;
		}

		h1 {
			font-size: 20px;
			font-style: normal;
			font-weight: normal;
			margin: 0px;
		}

		.body {
			background-color: #f5f5f5;
			color: #8A8A8A;
			font-family: Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif;
			-webkit-text-size-adjust:none !important;
			font-size: 16px;
			line-height: 150%;
			padding: 20px;
			margin: 0;
		}

	</style>
	</head>
    <body class="body">
		<table align="center" class="templateContainer">
			<tr>
				<td>
					<div align="center" class="templateHeader" style="min-height: 65px;padding: 9px 9px 34px 9px;">
						${logoImage(showLogo)}
					</div>
					<div class="content" styles="background-color: white; padding: 24px 18px;">
						${content}
                    </div>
					<br /> &nbsp;
					<div>
						<table align="center" border="0" cellpadding="0" cellspacing="0" class="d" style="border-collapse: separate !important;">
							<tbody>
								<tr>
									<td align="center" valign="middle" style="font-family: Roboto, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 18px; padding: 15px;">
										<a href="https://twitter.com/3drepo" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-twitter-48.png" alt="Twitter" height="24" width="24" class="iconLink" styles="display: inline-block;margin-right: 12px; margin-left: 12px;"></a>
										<a href="https://en-gb.facebook.com/3DRepo/" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-facebook-48.png" alt="Facebook" height="24" width="24" class="iconLink" styles="display: inline-block;margin-right: 12px; margin-left: 12px;"></a>
										<a href="https://www.linkedin.com/company/3d-repo" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-linkedin-48.png" alt="LinkedIn" height="24" width="24" class="iconLink" styles="display: inline-block;margin-right: 12px; margin-left: 12px;"></a>
										<a href="https://github.com/3drepo" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-github-48.png" alt="GitHub" height="24" width="24" class="iconLink" styles="display: inline-block;margin-right: 12px; margin-left: 12px;"></a>
										<a href="https://www.youtube.com/channel/UC9ofPaxxyQy0jPEB9YlNpuA" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-youtube-48.png" alt="YouTube" height="24" width="24" class="iconLink" styles="display: inline-block;margin-right: 12px; margin-left: 12px;"></a>
										<a href="https://www.3drepo.com" target="_blank"><img src="https://cdn-images.mailchimp.com/icons/social-block-v2/gray-link-48.png" alt="Website" height="24" width="24" class="iconLink"  styles="display: inline-block;margin-right: 12px; margin-left: 12px;"></a>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="contactInfo" style="font-family:roboto,helvetica neue,helvetica,arial,sans-serif">
						<strong>Our mailing address is:</strong><br/>
						3D Repo<br />
						307 Euston Road<br />
						London, NW1 3AD<br />
						United Kingdom
					</div>
				</td>
			</tr>
		</table>
    </body>
</html>`;

const SIGN_OFF =  `
	<br/>
	For any queries please contact our support team at <a href="mailto:support@3drepo.com?subject=Support%20Request" target="_blank"><span style="color:#3452ff">support@3drepo.com</span></a>
`;

const emailTemplate = (content, name) => emailContainer(true)(`
	<h1 style="font-size: 20px; font-style: normal; font-weight: normal; margin: 0px; mso-line-height-rule:exactly;">Hello  ${ name ? name + "," : ""}</h1> <br/>
	${content}
	<br/>
	All the best,<br/>
	3D Repo Team
`);

const ctaButton = (text, url, padding = 15) => `
<div style="width:100%;margin: 37px 0px 43px 0px;">
	<table align="center" border="0" cellpadding="0" cellspacing="0" class="d" style="border-collapse: separate !important;border-radius: 50px;background-color: #3452FF;">
	<tbody>
		<tr>
			<td align="center" valign="middle" style="font-family: Roboto, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 18px; padding: ${padding}px;">
				<a class="mcnButton " title="Reset Your Password" href="${url}" target="_blank" style="font-weight: normal;letter-spacing: 1px;line-height: 100%;text-align: center;text-decoration: none;color: #FFFFFF;">${text}</a>
			</td>
		</tr>
	</tbody>
	</table>
</div>
`;

module.exports = {
	basicEmailTemplate: emailTemplate,
	emailContainer: emailContainer(false),
	ctaButton,
	SIGN_OFF
};
