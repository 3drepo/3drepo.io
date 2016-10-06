var html = data => `
	Hi there,<br>
	<br>
	We have just refunded ${data.amount}  to you through PayPal.
	<br><br>
	If you have any questions please do not hesitate to contact us.
	<br><br>
	Best,<br>
	3D Repo
`;

var subject = 'We have refunded your payment to 3D Repo';

module.exports =  {
	html: html,
	subject: subject
};
