const localStorageCredentialsKey = 'cultScreenSessionCredentials';
const sessionistHeader = require('sessionistheader');

function addAccount(username, password) {
	return graphql(`
		mutation {
			addAccount (
				username:"${username}",
				password:"${password}"
			) {
				username
			}
		}
	`)
		.then(response => {
			return true;
		})
}

function assignScreenAccess(screen, username) {
	return graphql(`
		mutation {
			assignScreenAccess (
				username:"${username}",
				screen:"${screen}"
			) {
				username
			}
		}
	`)
	.then(response => {
		return true;
	});
}

function availableGoogleCalendars(username) {
	if (username) {
		return graphql(`
			query {
				accountByUsername(username:"${username}") {
					googlecalendars{
						id
						name
					}
				}
			}
		`)
		.then(response => {
			return response.accountByUsername.googlecalendars;
		})
	} else {
		return graphql(`
			query {
				currentSession {
					account {
						googlecalendars {
							id
							name
						}
					}
				}
			}
		`)
		.then(response => {
			return response.currentSession.account.googlecalendars
		})
	}
}

function availableScreens(username) {
	if (username) {
		return graphql(`
			query {
				accountByUsername(username:"${username}") {
					screens{
						id
						name
						url
						thumbnail
						provider
					}
				}
			}
		`)
		.then(response => {
			return response.accountByUsername.screens;
		})
	} else {
		return graphql(`
			query {
				currentSession {
					account {
						screens {
							id
							name
							url
							thumbnail
							provider
						}
					}
				}
			}
		`)
		.then(response => {
			return response.currentSession.account.screens
		})
	}
}

function delOption(optionKey) {
	return localStorage.removeItem('opt_' + optionKey);
}

function getOption(optionKey) {
	return new Promise((resolve, reject) => resolve())
	.then(() => localStorage.getItem('opt_' + optionKey))
	.then(JSON.parse)
	.catch(() => {
		return null;
	})
}

function graphql(query) {
	const url = cultScreen.apiBaseUrl + '/graphql';
	const path = url.replace(/^[^/]*\/[^/]*\/[^/]*\//, '/');
	const method = 'POST';
	const body = JSON.stringify({ query });
	const date = new Date().toUTCString();

	return new Promise((resolve, reject) => resolve())
	.then(() => localStorage.getItem(localStorageCredentialsKey))
	.then(JSON.parse)
	.catch(() => {
		return null;
	})
	.then(credentials => {
		if (!credentials) {
			return fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body
			})
		}
		return sessionistHeader(
			credentials.keyId,
			credentials.secretKey,
			method,
			path,
			body,
			date
		)
		.then(auth => fetch(url, {
			method,
			headers: {
				'Authorization': auth,
				'Content-Type': 'application/json',
				'X-Date': date
			},
			body
		}));
	})
	.then(response => response.json())
	.then(response => {
		/*
		console.log({
			query,
			response
		});
		*/
		if (response && response.errors) {
			throw new Error('Server side error: ' + response.errors[0].message);
		}
		if (!response || !response.data) {
			throw new Error('No data in response.');
		}
		return response.data;
	});
}

function login(username, password) {
	return graphql(`
		mutation {
			createSession (
				username:"${username}",
				password:"${password}"
			) {
				keyId
				secretKey
			}
		}
	`)
		.then(response => {
			if (
				!response.createSession ||
				!response.createSession.keyId ||
				!response.createSession.secretKey
			) {

				throw new Error('Invalid return data.');

			}
			const keyId = response.createSession.keyId;
			const secretKey = response.createSession.secretKey;
			localStorage.setItem(
				localStorageCredentialsKey,
				JSON.stringify({ keyId, secretKey })
			);
			return whoami();
		});
}

function logout() {
	return graphql(`
		mutation {
			deleteSession {
				position
			}
		}
	`)
		.catch(() => {})
		.then(() => {
			localStorage.removeItem(localStorageCredentialsKey);
		});
}

function news() {
	return getOption('news_source')
		.then(source => {
			if (!source) source = 'googe-news';
			return fetch(cultScreen.apiBaseUrl + '/news/articles/' + source)
				.then(response => response.json())
				.then(data => {
					return data;
				});
		})
		.then(data => data.articles);
}

function revokeScreenAccess(screen, username) {
	return graphql(`
		mutation {
			revokeScreenAccess (
				username:"${username}",
				screen:"${screen}"
			) {
				username
			}
		}
	`)
	.then(response => {
		return true;
	});
}

function setOption(optionKey, optionValue) {
	return localStorage.setItem('opt_' + optionKey, JSON.stringify(optionValue));
}

function googleCalendar() {
	return getOption('google_calendar_id')
		.then(id => {
			if (!id) id = '';
			return fetch(cultScreen.apiBaseUrl + '/calendar/events/' + id)
				.then(response => response.json())
				.then(data => {
					return data;
				});
		});
}

function googleTrends() {
	return getOption('google_trends_location')
		.then(location => {
			if (!location) location = 'se';
			return fetch(cultScreen.apiBaseUrl + '/google/trends/' + location)
				.then(response => response.json())
				.then(data => {
					return data;
				});
		});
}

function imgur() {
	return getOption('imgur_sort')
		.then(sort => {
			if (!sort) location = 'top';
			return fetch(cultScreen.apiBaseUrl + '/imgur/memes/' + sort)
				.then(response => response.json())
				.then(data => {
					return data;
				});
		});
}

function twitter() {
	return getOption('twitter_location')
		.then(location => {
			if (!location) location = 'sweden';
			return fetch(cultScreen.apiBaseUrl + '/twitter/trends/' + location)
				.then(response => response.json())
				.then(data => {
					return data;
				});
		})
		.then(data => data[0].trends);
}

function whoami() {
	return graphql(`
		query {
			currentSession {
				account {
					username
				}
			}
		}
	`)
		.then(response => {
			if (
				!response.currentSession ||
				!response.currentSession.account ||
				!response.currentSession.account.username
			) {
				throw new Error('Session not valid.');
			}
			return response.currentSession.account.username;
		});
}

function youtube() {
	return getOption('youtube_location')
		.then(location => {
			if (!location) location = 'se';
			return fetch(cultScreen.apiBaseUrl + '/youtube/mostpopular/' + location)
				.then(response => response.json())
				.then(data => {
					return data;
				});
		});
}

const cultScreen = {
	addAccount,
	apiBaseUrl: window.location.origin,
	assignScreenAccess,
	availableGoogleCalendars,
	availableScreens,
	delOption,
	getOption,
	googleCalendar,
	googleTrends,
	imgur,
	login,
	logout,
	news,
	revokeScreenAccess,
	setOption,
	twitter,
	whoami,
	youtube
};

if (typeof window !== 'undefined') {
	window.cultScreen = cultScreen;
}

module.exports = cultScreen;

