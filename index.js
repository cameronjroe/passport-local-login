import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import passport from 'passport';
import mongoose from 'mongoose';
import User from './models/User';
import {Strategy} from 'passport-local';

let app = express();

mongoose.connect('mongodb://localhost:27017/passport-local');

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({
  secret: 'secret'
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new Strategy((username, password, done) => {
  User.findOne({name: username}, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false);
    if (user.password !== password) {
      return done(null, false);
    }
    return done(null, user);
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get('/create-user', (req, res, next) => {
  var user = new User({
    name: 'Cameron',
    password: 'password'
  });
  user.save((err) => {
    if (err) return next(err);
    res.json({success: true});
  });
});

app.get('/user', (req, res, next) => {
  User.findOne({name: req.query.name}, (err, user) => {
    res.json({err, user});
  });
});

app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

app.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});

app.get('/', (req, res, next) => {
  if (req.user) {
    res.send('Logged In <a href="/logout">Log Out</a>');
  } else {
    res.send(`
      <form action="/login" method="post">
          <div>
              <label>Username:</label>
              <input type="text" name="username"/>
          </div>
          <div>
              <label>Password:</label>
              <input type="password" name="password"/>
          </div>
          <div>
              <input type="submit" value="Log In"/>
          </div>
      </form>
      `);
  }
});

app.use((req, res, next) => {
  res.send('ERROR');
});

app.listen(app.get('port'), () => {
  console.log('Listening on port', app.get('port'));
});