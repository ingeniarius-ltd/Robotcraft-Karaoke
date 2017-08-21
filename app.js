const config = require('./config')
const express = require('express')
const app = express()
const server = require('http').createServer(app);  
const io = require('socket.io')(server);
const fs = require('fs');
const bodyParser = require('body-parser');
const session = require('express-session')
const passport = require('passport')
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(new BasicStrategy(
    function(userid, password, done) {
        if(userid == config.admin_info.id && password == config.admin_info.password) {
            return done(null, true);
        }
        else {
            return done(null, false);
        }
    }
));

let mysql = require('mysql');

const connection = mysql.createPool(config.mysql_info);

let songs = [];

connection.query('SELECT name FROM musics', function (error, results, fields) {
    if (error) throw error;
    results.forEach(function(element) {
        songs.push(element.name);
    }, this);
});


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(session({ resave: false,  saveUninitialized: true, secret: config.session_secret }));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

app.use(express.static('public'))

app.get('/', function (req, res) {
    res.render('index');
});

app.get('/songs/:song_name', function(req,res) {
    let song_name = "%"+req.params.song_name+"%";
    connection.query('SELECT name FROM musics WHERE name LIKE ?',[song_name], function (error, results, fields) {
        if (error) throw error;
        let match_songs = [];
        results.forEach(function(element) {
            match_songs.push(element.name);
        }, this);
        res.json(match_songs);
    });
});

app.get('/entry', function(req,res) {
    res.render('entry', {text: req.query.text});
});

app.get('/admin/',passport.authenticate('basic', { session: false }), function(req,res) {
    connection.query('SELECT * FROM entries WHERE archived=0', function (error, results, fields) {
      if (error) throw error;
          res.render('table', {entries: results});
    });
});

app.get('/admin/archive/:id',passport.authenticate('basic', { session: false }), function(req,res) {
    connection.query('UPDATE entries SET archived=1 WHERE id=?',[req.params.id], function (error, results, fields) {
        if (error) throw error;
    });
    res.redirect('/admin')
});

app.post('/entry', function(req,res) {
    if(config.accepting_entries) {
        if(req.body.song && req.body.singers) {
            let text = encodeURIComponent(config.lang.song_not_found);
            if(songs.includes(req.body.song)) {
                connection.query("INSERT INTO entries(song,singers) VALUES (?,?)", [req.body.song,req.body.singers], function (error, results, fields) {
                    if (error) throw error;
                });
                text = encodeURIComponent(config.lang.submission_accepted);

            }
            res.redirect('/entry?text='+text);
        }
        else {
            res.redirect('/');
        }
    }
    else {
        let text = encodeURIComponent(config.lang.not_accepting_entries);
        res.redirect('/entry?text='+text);
    }
});

server.listen(8081, function () {
	  console.log('Listening on port 8081');
})