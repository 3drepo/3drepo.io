
const baseTemplate = require('./baseTemplate');
const config = require('../../../utils/config');

const getEmailContent = data => `
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
                                 <span style="font-size:15px">Thank you for signing up to 3D Repo!<br>
                                 Please click on the button below to verify your email address.</span>
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
                        <a href="${config.getBaseUrl()}/register-verify?username=${data.username}&token=${data.token}${(data.pay ? "&pay=true" : "")}" title="" class="" target="_blank">
                        <img align="center" alt="" src="https://3drepo.com/wp-content/uploads/email/Verify%20email%20address.png" width="564" style="max-width:1200px; padding-bottom: 0; display: inline !important; vertical-align: bottom;" class="mcnImage">
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
                                 <span style="font-size:15px">By verifying your email address you are agreeing to 3D Repo's <a href="https://www.3drepo.io/terms" target="_blank"><span style="color:#3452ff">Terms of Service</span></a><br>
                                 For any queries please contact our support team at <a href="mailto:support@3drepo.org?subject=Support%20Query" target="_blank"><span style="color:#3452ff">support@3drepo.org</span></a></span>
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

const html = data => baseTemplate.html({ ...data, emailContent: getEmailContent(data) });

module.exports = {
	html,
	subject: "Welcome to 3D Repo! Verify Your Email‏"
};
