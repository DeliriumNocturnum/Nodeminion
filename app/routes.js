var ObjectId = require('mongoose').Types.ObjectId;

// app/routes.js
module.exports = function(app, passport, mongoose) {

    // Home page
    app.get('/', function(req, res) {
	
		userSessions(req.user, userData);
	
		function userSessions(user, userData) {
			return mongoose.connection.db.collection('sessions', function(err, collection) {
				collection.find({}).toArray( function(err, results) {
					var sessArray = [];
					for (var i = 0; i < results.length; i++) {
						if (!JSON.parse(results[i].session).passport.user) {
							continue;
						} else {
							sessArray.push(new ObjectId(JSON.parse(results[i].session).passport.user));
						}
					}
					userData(sessArray, writeResults);
				});
			});
		};
		
		function userData(users, writeResults) {
			return mongoose.connection.db.collection('users', function(err, collection) {
				collection.find({ _id: { $in: users}}, {_id:0,'local.username':1}).toArray( function(err, results) {
					writeResults(results);
				});
			});
		
		};
		
		function writeResults(currSessions) {
			res.render('pages/index.ejs', {
				user : req.user,
				onUsers : currSessions
			}); // load the index.ejs file
		}	
    });

	// About page
	app.get('/about', function(req, res) {
		res.render('pages/about.ejs');
	});
 
    // Login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('pages/login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile',
		failureRedirect : '/login',
		failureFlash : true
	}));

    // Signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('pages/signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile',
		failureRedirect : '/signup',
		failureFlash: true
	}));

    // Profile page
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('pages/profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // Logout page
    app.get('/logout', function(req, res) {
		req.session.destroy();
//		mongoose.connection.db.collection('sessions', function (err, collection) {
//			collection.remove({session : '/\//\"54f841ae33691467406e0c56\"/\//'}).exec();
//		});
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}