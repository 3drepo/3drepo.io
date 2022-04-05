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

const baseTemplate = require('./baseTemplate');
const config = require('../../../utils/config');

const getEmailContent = (data) => `
<table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
   <tbody class="mcnTextBlockOuter">
      <tr>
         <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
            <!--[if mso]>
            <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
               <tr>
                  <![endif]-->
                  <!--[if mso]>
                  <td valign="top" width="600" style="width:600px;">
                     <![endif]-->
                     <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                        <tbody>
                           <tr>
                              <td valign="top" class="mcnTextContent" style="padding: 0px 18px 9px; line-height: 200%; text-align: left;">
                                 <span style="font-size:15px">We received a request to reset your password, for username <strong>${data.username}</strong>.<br>
                                 Use the link below to set up a new password for your account.</span>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                     <!--[if mso]>
                  </td>
                  <![endif]-->
                  <!--[if mso]>
               </tr>
            </table>
            <![endif]-->
         </td>
      </tr>
   </tbody>
</table>
<table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;">
   <tbody class="mcnDividerBlockOuter">
      <tr>
         <td class="mcnDividerBlockInner" style="min-width: 100%; padding: 5px 18px;">
            <table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top: 2px none #EAEAEA;">
               <tbody>
                  <tr>
                     <td>
                        <span></span>
                     </td>
                  </tr>
               </tbody>
            </table>
            <!--
               <td class="mcnDividerBlockInner" style="padding: 18px;">
               <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
               -->
         </td>
      </tr>
   </tbody>
</table>
<table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%;">
   <tbody class="mcnImageBlockOuter">
      <tr>
         <td valign="top" style="padding:9px" class="mcnImageBlockInner">
            <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;">
               <tbody>
                  <tr>
                     <td class="mcnImageContent" valign="top" style="padding-right: 9px; padding-left: 9px; padding-top: 0; padding-bottom: 0; text-align:center;">
                        <!-- buttonImage -->
                        <a href="${config.getBaseURL()}/password-change?username=${data.username}&token=${data.token}" title="" class="" target="_blank">
                        <img align="center" alt="" src="https://3drepo.com/wp-content/uploads/email/Reset%20Your%20Password.png" width="400" style="max-width:400px; padding-bottom: 0; display: inline !important; vertical-align: bottom;" class="mcnImage">
                        </a>
                     </td>
                  </tr>
               </tbody>
            </table>
         </td>
      </tr>
   </tbody>
</table>
<table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;">
   <tbody class="mcnDividerBlockOuter">
      <tr>
         <td class="mcnDividerBlockInner" style="min-width: 100%; padding: 5px 18px;">
            <table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top: 2px none #EAEAEA;">
               <tbody>
                  <tr>
                     <td>
                        <span></span>
                     </td>
                  </tr>
               </tbody>
            </table>
            <!--
               <td class="mcnDividerBlockInner" style="padding: 18px;">
               <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
               -->
         </td>
      </tr>
   </tbody>
</table>
<table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
   <tbody class="mcnTextBlockOuter">
      <tr>
         <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
            <!--[if mso]>
            <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
               <tr>
                  <![endif]-->
                  <!--[if mso]>
                  <td valign="top" width="600" style="width:600px;">
                     <![endif]-->
                     <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                        <tbody>
                           <tr>
                              <td valign="top" class="mcnTextContent" style="padding: 0px 18px 9px; line-height: 200%; text-align: left;">
                                 <span style="font-size:15px">If you did not request a password reset, please ignore this email and contact us at <a href="mailto:support@3drepo.org?subject=Support%20Query" target="_blank"><span
                                    style="color:#3452ff">support@3drepo.org</span></a> so we can make sure no one else is trying to access your account.<br><br>
                                 This password reset is only valid for 24 hours.</span>
                              </td>
                           </tr>
                        </tbody>
                     </table>
                     <!--[if mso]>
                  </td>
                  <![endif]-->
                  <!--[if mso]>
               </tr>
            </table>
            <![endif]-->
         </td>
      </tr>
   </tbody>
</table>
`;

const html = (data) => baseTemplate.html({ ...data, emailContent: getEmailContent(data) });

module.exports = {
	html,
	subject: 'Reset your password',
};
