// The BetFair session class below contains all the methods to call the
// BetFair API. Some samples are commented below to demonstrate their utility.
const BetFairSession = require('./session.js');

/* User details */
const USERNAME = 'joshbetting30@yahoo.com';
const PASSWORD = '!fBq2JiCDNrNfkj';
const APPKEY = 'qI6kop1fEslEArVO';
const io = require('socket.io')(8000);

io.on('connection', (client) => {
	// Here you can start emitting events to the client 
	console.log('connection');

	this.bfSession = new BetFairSession(APPKEY);

	this.bfSession.login(USERNAME, PASSWORD).then((res) => {
		console.log('sesss', this.bfSession);
		this.bfSession.getDeveloperAppKeys({filter: {}}, function(err, res) {
			// var vendorId = res.result[1].appVersions[0].vendorId;
			// var vendorSecret = res.result[1].appVersions[0].vendorSecret;
			console.log(res.result[1]);
		});
	}).bind(this);

	client.on('login', (data) => {
		this.bfSession.login(data.user, data.pass).then((res) => {
			console.log('bf sess on login', this.bfSession);
			console.log('login serv');
			 client.emit('loggedIn', {sessionKey: res.sessionKey});
		}).catch(err => client.emit('loggedIn', {error: err}));
	});

	client.on('get_account_funds', (data) => {
		this.bfSession.sessionKey = data.sessionKey;
		this.bfSession.getAccountFunds({filter: {}}, function(err, res) {

			if (err) client.emit('balance', {error: err});
			else client.emit('balance', {balance: res.result.availableToBetBalance});
		}.bind(this));
	});

	client.on('request_access_token', (data) => {
		// console.log('bf session', this.bfSession);
		this.bfSession.sessionKey = data.sessionKey;
		// console.log(this.bfSession.sessionKey);
		var tokenFilter = {
				"client_id": "74333,",
				"grant_type": "AUTHORIZATION_CODE",
				"client_secret": "6d912070-7cda-47c9-819f-20ea616fd35c",
				"code": data.code
			
		}
		this.bfSession.token(tokenFilter, function(err, res) {
			console.log(res.error);
			client.emit('access_token', res);
		});
	});

		// An sample filter used to call BetFair method 'listMarketCatalogue'
		// with the event type (horse racing = 7). Normally you would call
		// 'listEvents' to get the ids of the event you want to search.
		var exampleFilter = {
		    filter: {
		        "eventTypeIds": [
		            7
		        ],
		        "marketCountries": [
		            "GB"
		        ],
		        "marketTypeCodes": [
		            "WIN"
		        ],
		        "marketStartTime": {
		            "from": new Date().toJSON()
		        }
		    },
		    "sort": "FIRST_TO_START",
		    "maxResults": "1",
		    "marketProjection": [
		        "RUNNER_DESCRIPTION"
		    ]
		}
		// Query to find market information for the example filter
		// this.bfSession.listMarketCatalogue(exampleFilter, function(err, res) {
		    // console.log("Response:%s\n", JSON.stringify(res.response, null, 2));
		// });

		// A call to get the vendor id, which I think is required for O-auth
		// this.bfSession.getDeveloperAppKeys({filter: {}}, function(err, res) {
		// 	var vendorId = res.result[1].appVersions[0].vendorId;
		// 	var vendorSecret = res.result[1].appVersions[0].vendorSecret;
		// });
	// });
});