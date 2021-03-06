// Import dependencies
import bodyParser from 'body-parser';
import express from 'express';
import dotenv from 'dotenv';
import expressValidator from 'express-validator';
import path from 'path';
import mongoose from 'mongoose';
import morgan from 'morgan';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import route from './routes/routes';

mongoose.Promise = global.Promise;
dotenv.config();
const port = parseInt(process.env.PORT, 10) || 8000;
const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(expressValidator());
app.use('/api/v1', route);

if (process.env.NODE_ENV !== 'production') {
  if (process.env.NODE_ENV === 'test') {
    mongoose.connect(process.env.MONGODB_URL);
  } else {
    // Development configuration
    mongoose.connect(process.env.MONGODB_URL_DEV);
    const config = require('../webpack.dev');
    // *** webpack compiler ***
    const compiler = webpack(config);

    // *** webpack middleware
    app.use(webpackDevMiddleware(compiler, {
      noInfo: true,
      publicPath: config.output.publicPath
    }));
    app.use(webpackHotMiddleware(compiler));
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
      res.sendFile(`${process.cwd()}/client/build/index.html`);
    });
  }
} else {
  // Production configuration
  mongoose.connect(process.env.MONGODB_URL_PRO);
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) =>
    res.sendFile(`${process.cwd()}/client/build/index.html`));
}

app.listen(port);

module.exports = app;
