var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var uuid = require('uuid/v4');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

/* Rotas do Sistema. */
var adminRouter = require('./routes/admin');
var adminAPIRouter = require('./routes/api/admin');
var ingestRouter = require('./routes/ingest');
var consumerRouter = require('./routes/consumer');
var indexRouter = require('./routes/index');
var registoRouter = require('./routes/registo');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');

require('./auth/auth');

var app = express();

/* Base de Dados */
mongoose.connect('mongodb://127.0.0.1:27017/iBanda', { useNewUrlParser: true, useCreateIndex: true })
    .then(() => console.log('Mongo ready: ' + mongoose.connection.readyState))
    .catch(() => console.log('Erro na conexão à BD!'));

// Configuração da sessão.
app.use(session({
    genid: () => { return uuid(); },
    store: new FileStore({logFn: function(){}}),
    secret: 'ibanda',
    resave: false,
    saveUninitialized: true
}));

// Inicialização do passport.
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRouter);
app.use('/api/admin', adminAPIRouter);
app.use('/', indexRouter);
app.use('/registo', registoRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/consumer', consumerRouter);
app.use('/ingest', ingestRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
