const {TwitterApi} = require('twitter-api-v2');

const client = new TwitterApi({
	appKey: "0mWelvgBl1Mm9SHZgqsT9Mfpw",
	appSecret: "npEDg7AowdGZvFYK2XAbHAhgrDsUfpssFyPJaFbMh7LEtytCyV",
	accessToken: "1117234123-Gg15jU1q4ZBEsiXaW3BB3ukjZ93eMBVNUPyUX05",
	accessSecret: "gZCGDyLDbLYGkETC48clWNljBGELvvWBoiUrNMfXquTrP"
});

const rclient = client.readOnly;

const readIdLeg = async () => {
	rclient.v1.tweets({
		query: '%23idpol', 
		result_type:"recent"
	}).then((response) => {
		console.log(response)
	}).catch((err) => {
		console.error(error)
	});
	
}

readIdLeg();
