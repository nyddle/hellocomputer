var FACEBOOK_APP_ID = "318387568181534",
	FACEBOOK_APP_SECRET = "9dfe22b3b1507ad23a4c622002d1c87d",
	VKONTAKTE_APP_ID = "3263470",
	VKONTAKTE_APP_SECRET = "6QhEjbT3WuF983eO49aR",
	ODNOKLASSNIKI_APP_ID = "0",
	ODNOKLASSNIKI_APP_PUBLIC_KEY = "0",
	ODNOKLASSNIKI_APP_SECRET_KEY = "0";



passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new FacebookStrategy({
	clientID: FACEBOOK_APP_ID,
	clientSecret: FACEBOOK_APP_SECRET,
	callbackURL: 'http://localhost/auth/facebook/callback',
}, function(accessToken, refreshToken, profile, done) {
	return done(null, profile);
}));

passport.use(new VKontakteStrategy({
	clientID: VKONTAKTE_APP_ID,
	clientSecret: VKONTAKTE_APP_SECRET,
	callbackURL: "http://localhost/auth/vkontakte/callback"
}, function(accessToken, refreshToken, profile, done) {
	return done(null, profile);
}));

passport.use(new OdnoklassnikiStrategy({
	clientID: ODNOKLASSNIKI_APP_ID,
	clientPublic: ODNOKLASSNIKI_APP_PUBLIC_KEY,
	clientSecret: ODNOKLASSNIKI_APP_SECRET_KEY,
	callbackURL: "http://localhost/auth/odnoklassniki/callback"
}, function(accessToken, refreshToken, profile, done) {
	return done(null, profile);
}));

// Auth
app.get('/auth/facebook', passport.authenticate('facebook', {
	display: 'popup'
}), function(req, res) {});
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
	failureRedirect: '/login'
}), function(req, res) {
	res.redirect('/auth/ok');
});


app.get('/auth/vkontakte', passport.authenticate('vkontakte'), function(req, res) {});
app.get('/auth/vkontakte/callback', passport.authenticate('vkontakte', {
	failureRedirect: '/login'
}), function(req, res) {
	res.redirect('/auth/ok');
});

app.get('/auth/ok', function (req, res) { res.render('auth.ok.html') }); // !!! it was auth.ok

exports.ok = function(req, res) {
	res.render('auth_ok.html');
};

