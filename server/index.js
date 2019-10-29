// This adds environment-specific variables on new lines in the form of NAME=VALUE
// Access with process.env
require("dotenv").config();

// The BetFair session class below contains all the methods
// to call the BetFair API. Some samples are commented below to demonstrate their utility.
const BetFairSession = require("./BetFair/session.js");
const ExchangeStream = require("./BetFair/stream-api.js");

const betfair = new BetFairSession(process.env.APP_KEY);

const session = require('express-session');

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

const database = require("./Database/helper");
const User = require('./Database/models/users');

// Load the session key from localStorage into the database and session object
app.get("/api/load-session", (request, response) => {
	betfair.setActiveSession(request.query.sessionKey);
	betfair.setEmailAddress(request.query.email);

	response.sendStatus(200);
});

app.get("/api/get-subscription-status", (request, response) => {
	betfair.isAccountSubscribedToWebApp(
		{
			vendorId: process.env.APP_ID
		},
		(err, res) => {
			response.json({
				isSubscribed: res.result
			});
		}
	);
});

app.get("/api/request-access-token", (request, response) => {

	const params = {
		client_id: process.env.APP_ID,
		grant_type: request.query.tokenType,
		client_secret: process.env.APP_SECRET
	}

	const setupTokenInfo = async () => {
		if (request.query.tokenType === "REFRESH_TOKEN") {
			var storedTokenData = await database.getTokenData(betfair.email);

			if (storedTokenData.expiresIn < new Date()) {
				params.refresh_token = storedTokenData.refreshToken;
				token();
			} else {
				response.json(storedTokenData);
			}
		} else if (request.query.tokenType === "AUTHORIZATION_CODE") {
			params.code = request.query.code;
			token();
		}
	};

	const token = async () => {
		betfair.token(params, (err, res) => {
			var tokenInfo = {
				accessToken: res.result.access_token,
				expiresIn: new Date(new Date().setSeconds(new Date().getSeconds() + res.result.expires_in)),
				refreshToken: res.result.refresh_token
			};
			// Update the user details with the token information
			database.setToken(betfair.email, tokenInfo).then(() => { response.json(tokenInfo) });
		}
		);
	}

	setupTokenInfo();
});

app.get("/api/login", (request, response) => {
	betfair
		.login(request.query.user, request.query.pass)
		.then(res => {
			response.json({
				sessionKey: res.sessionKey
			});
			// Check if user exists, if doesn't exist, then create a new user
			database.setUser(request.query.user, res.sessionKey);
		})
		.bind(this)
		.catch(err =>
			response.json({
				error: err
			})
		);
});

app.get("/api/logout", (request, response) => {
	betfair
		.logout()
		.then(res => {
			response.json(res);
		})
		.bind(this)
		.catch(err =>
			response.json({
				error: err
			})
		);
});

app.get("/api/get-account-balance", (request, response) => {
	betfair.getAccountFunds(
		{
			filter: {}
		},
		(err, res) => {
			response.json({
				balance: res.result.availableToBetBalance
			});
		}
	);
});

app.get("/api/get-account-details", (request, response) => {
	betfair.getAccountDetails(
		{
			filter: {}
		},
		(err, res) => {
			response.json({
				name: res.result.firstName,
				countryCode: res.result.countryCode,
				currencyCode: res.result.currencyCode,
				localeCode: res.result.localeCode
			});
		}
	);
});

app.get("/api/get-events-with-active-bets", (request, response) => {
	betfair.listCurrentOrders(
		{
			filter: {}
		},
		(err, res) => {
			const filteredOrders = res.result.currentOrders = res.result.currentOrders.filter((data, index, order) =>
			index === order.findIndex((t) => (
			  
			  t.marketId === data.marketId
			))
		  )
		  .map(order => order.marketId);
			betfair.listMarketCatalogue(
				{
					filter: {
						marketIds: filteredOrders
					},
					maxResults: 100
				},
				(err, res) => {
					response.json(res.result);
				}
			)
		}
	);
});
//
app.get("/api/premium-status", (request, response) => {
	database.getPremiumStatus(betfair.email).then(expiryDate => {
		response.json(expiryDate);
	});
});


app.get("/api/get-user-settings", (request, response) => {
	database.getSettings(betfair.email).then(settings => {
		response.json(settings);
	});
});

app.post("/api/save-user-settings", (request, response) => {
	database.updateSettings(betfair.email, request.body).then(res => {
		response.sendStatus(res);
	});
});

app.get("/api/get-all-orders", (request, response) => {
	database.getAllOrders(betfair.email).then(res => {
		response.json(res);
	});
});

app.post("/api/save-order", (request, response) => {
	database.saveOrder(betfair.email, request.body).then(res => {
		response.sendStatus(res);
	});
});

app.post("/api/update-order", (request, response) => {
	database.updateOrderKey(betfair.email, request.body).then(res => {
		response.sendStatus(res);
	});
});

app.post("/api/remove-orders", (request, response) => {
	database.removeOrders(betfair.email, request.body).then(res => {
		response.sendStatus(res);
	});
});

app.get("/api/get-all-sports", (request, response) => {
	betfair.listEventTypes(
		{
			filter: {}
		},
		(err, res) => {
			response.json(res.result);
		}
	);
});

app.get("/api/get-my-markets", (request, response) => {
	return new Promise((res, rej) => {
		User.findOne({email: betfair.email}).then(doc => response.json(doc.markets))
		.catch(err => response.sendStatus(400));
	});
});

app.post("/api/save-market", (request, response) => {
	database.saveMarket(betfair.email, request.body).then(res => {
		response.json(res);
	});
});

app.post("/api/remove-market", (request, response) => {
	database.removeMarket(betfair.email, request.body).then(res => {
		response.json(res);
	});
});

app.get("/api/list-todays-card", (request, response) => {
	betfair.listMarketCatalogue({
		filter: {
			"eventTypeIds": [
				// 7
				request.query.sportId
			],
			"marketTypeCodes": [
				// "WIN"
				request.query.marketTypes
			],
			"marketStartTime": {
				"from": new Date().toJSON(),
				"to": new Date(new Date().setSeconds(new Date().getSeconds() + 86400)).toJSON()
			}
		},
		"sort": "FIRST_TO_START",
		"maxResults": "1000",
		"marketProjection": [
			"COMPETITION",
			"EVENT",
			"EVENT_TYPE",
			"MARKET_START_TIME"
		]
	}, (err, res) => {
		response.json(res.result);
	});
});

app.get("/api/list-countries", (request, response) => {
	betfair.listCountries(
		{
			filter: {
				eventTypeIds: [request.query.sportId],

			}
		},
		(err, res) => {
			response.json(res.result);
		}
	);
});

app.get("/api/list-competitions", (request, response) => {
	betfair.listCompetitions(
		{
			filter: {
				eventTypeIds: [request.query.sportId],
				marketCountries: [request.query.country],

			}
		},
		(err, res) => {
			response.json(res.result);
		}
	);
});

app.get("/api/list-events", (request, response) => {
	betfair.listEvents(
		{
			filter: {
				eventTypeIds: [request.query.sportId],
				marketCountries: [request.query.country],

			}
		},
		(err, res) => {
			response.json(res.result);
		}
	);
});

app.get("/api/list-competition-events", (request, response) => {
	betfair.listEvents(
		{
			filter: {
				competitionIds: [request.query.competitionId],
				marketCountries: [request.query.country],

			}
		},
		(err, res) => {
			response.json(res.result);
		}
	);
});

app.get("/api/list-markets", (request, response) => {
	const filter = {
		eventIds: [request.query.eventId],
		
	};
	switch (request.query.eventId) {
		case 1:
			filter.marketTypeCodes = ["MATCH_ODDS"];
		case 7:
			filter.marketTypeCodes = ["WIN"];
	}

	betfair.listMarketCatalogue(
		{
			filter,
			sort: "MAXIMUM_TRADED",
			maxResults: 1000
		},
		(err, res) => {
			response.json(res);
		}
	);
});

app.get("/api/get-market-info", (request, response) => {
	betfair.listMarketCatalogue(
		{
			filter: {
				marketIds: [request.query.marketId]
			},
			marketProjection: [
				"COMPETITION",
				"EVENT",
				"EVENT_TYPE",
				"MARKET_START_TIME",
				"MARKET_DESCRIPTION",
				"RUNNER_DESCRIPTION",
				"RUNNER_METADATA"
			],
			maxResults: 1
		},
		(err, res) => {
			response.json(res);
		}
	);
});

app.get("/api/list-market-book", (request, response) => {
	betfair.listMarketBook(
		{			
			marketIds: [request.query.marketId],
			priceProjection: {priceData:["EX_TRADED","EX_ALL_OFFERS"]}
		},
		(err, res) => {
			response.json(res);
		}
	);
});


app.post("/api/place-order", (request, response) => {

	betfair.placeOrders(
		{
			marketId: request.body.marketId,
			instructions: [
				{
					selectionId: request.body.selectionId,
					handicap: "0",
					side: request.body.side,
					orderType: "LIMIT",
					limitOrder: {
						size: request.body.size,
						price: request.body.price,
						persistenceType: "PERSIST",
						minFillSize: request.body.minFillSize || 1
					}
				}
			],
			customerStrategyRef: request.body.customerStrategyRef
		},
		(err, res) => {
			response.json(res.result);
		}
	);
});

app.get("/api/listCurrentOrders", (request, response) => {
	betfair.listCurrentOrders({
		marketIds: [request.query.marketId]
	},
		(err, res) => {
			response.json(res.result)
		})
});


app.post("/api/cancel-order", (request, response) => {
	betfair.cancelOrders(
		{
			marketId: request.body.marketId,
			instructions: [
				{
					betId: request.body.betId,
					sizeReduction: request.body.sizeReduction
				}
			],
			customerRef: request.body.customerRef
		},
		(err, res) => {
			response.json(res.result);
		}
	);
});

app.post("/paypal-transaction-complete", (request, response) => {
	database.saveTransaction(betfair.email, request.body).then(res => {
		response.sendStatus(res);
	});
});

// A call to get required params for O-auth (vendorId, vendorSecret)
app.get("/api/get-developer-application-keys", (request, response) => {
	betfair.getDeveloperAppKeys(
		{
			filter: {}
		},
		(err, res) => {
			var vendorId = res.result[1].appVersions[0].vendorId;
			var vendorSecret = res.result[1].appVersions[0].vendorSecret;
			response.json({
				vendorId,
				vendorSecret
			});
		}
	);
});
//
const port = 3001;
app.listen(port, () => console.log(`Server started on port: ${port}`));

process.stdin.resume(); //so the program will not close instantly

const exitHandler = (options, exitCode) => {
	if (exitCode || exitCode === 0) console.log(exitCode);
	if (options.exit) process.exit();
};

// App is closing
process.on(
	"exit",
	exitHandler.bind(null, {
		cleanup: true
	})
);

// Catches ctrl+c event
process.on(
	"SIGINT",
	exitHandler.bind(null, {
		exit: true
	})
);

// Catches "kill pid" (for example: nodemon restart)
process.on(
	"SIGUSR1",
	exitHandler.bind(null, {
		exit: true
	})
);
process.on(
	"SIGUSR2",
	exitHandler.bind(null, {
		exit: true
	})
);

// Catches uncaught exceptions
process.on(
	"uncaughtException",
	exitHandler.bind(null, {
		exit: true
	})
);

const io = require("socket.io")(8000);
io.on("connection", async client => {
	const exchangeStream = new ExchangeStream(client);

	// Subscribe to market
	client.on("market-subscription", async data => {
		const accessToken = await database.getToken(betfair.email);
		const subscription = `{"op":"marketSubscription","id":2,"marketFilter":{"marketIds":["${data.marketId}"]},"marketDataFilter":{"ladderLevels": 10}}\r\n`;
		exchangeStream.authenticate(subscription, accessToken);
	});
	// Subscribe to orders
	client.on("order-subscription", async data => {
		const accessToken = await database.getToken(betfair.email);
		const subscription = `{"op":"orderSubscription","orderFilter":{"includeOverallPosition":false, "customerStrategyRefs":${data.customerStrategyRefs}},"segmentationEnabled":true}\r\n`;
		exchangeStream.authenticate(subscription, accessToken);
	});
});
