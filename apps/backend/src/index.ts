import express from 'express';
import v1Router from './router/v1';
import cors from 'cors';
import { initPassport } from './passport';
import authRoute from './router/auth';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { COOKIE_MAX_AGE } from './consts';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());

const isProduction = process.env.NODE_ENV === 'production';

app.use(
  session({
    secret: process.env.COOKIE_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { 
      secure: isProduction, 
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: COOKIE_MAX_AGE 
    },
  }),
);

initPassport();
app.use(passport.initialize());
app.use(passport.authenticate('session'));

const allowedHosts = process.env.ALLOWED_HOSTS
  ? process.env.ALLOWED_HOSTS.split(',')
  : [];

app.use(
  cors({
    origin: allowedHosts,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  }),
);

app.use('/auth', authRoute);
app.use('/v1', v1Router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
