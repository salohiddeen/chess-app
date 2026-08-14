import { Request, Response, Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { COOKIE_MAX_AGE } from '../consts';

const router = Router();

const CLIENT_URL =
  process.env.AUTH_REDIRECT_URL ?? 'https://chess-app-frontend-alpha.vercel.app/game/random';
const BASE_BACKEND_URL =
  process.env.BACKEND_URL || 'https://chess-app-6g4f.onrender.com';
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface userJwtClaims {
  userId: string;
  name: string;
  isGuest?: boolean;
}

interface UserDetails {
  id: string;
  token?: string;
  name: string;
  isGuest?: boolean;
}

router.post('/guest', async (req: Request, res: Response) => {
  try {
    const bodyData = req.body;
    let guestUUID = 'guest-' + uuidv4();

    const user = await db.user.create({
      data: {
        username: guestUUID,
        email: guestUUID + '@chess100x.com',
        name: bodyData.name || guestUUID,
        provider: 'GUEST',
      },
    });

    const token = jwt.sign(
      { userId: user.id, name: user.name, isGuest: true },
      JWT_SECRET,
    );

    const UserDetails: UserDetails = {
      id: user.id,
      name: user.name!,
      token: token,
      isGuest: true,
    };

    res.cookie('guest', token, { maxAge: COOKIE_MAX_AGE });
    res.json(UserDetails);
  } catch (error) {
    console.error('Guest Auth Error:', error);
    res.status(500).json({ error: 'Failed to create guest user' });
  }
});

router.get('/refresh', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader = authHeader && authHeader.split(' ')[1];

    if (tokenFromHeader) {
      const decoded = jwt.verify(tokenFromHeader, JWT_SECRET) as userJwtClaims;
      const userDb = await db.user.findFirst({
        where: { id: decoded.userId },
      });

      if (!userDb) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const newToken = jwt.sign(
        { userId: userDb.id, name: userDb.name },
        JWT_SECRET,
      );

      return res.json({
        token: newToken,
        id: userDb.id,
        name: userDb.name,
      });
    }

    if (req.cookies && req.cookies.guest) {
      const decoded = jwt.verify(req.cookies.guest, JWT_SECRET) as userJwtClaims;
      const token = jwt.sign(
        { userId: decoded.userId, name: decoded.name, isGuest: true },
        JWT_SECRET,
      );

      let User: UserDetails = {
        id: decoded.userId,
        name: decoded.name,
        token: token,
        isGuest: true,
      };

      res.cookie('guest', token, { maxAge: COOKIE_MAX_AGE });
      return res.json(User);
    }

    return res.status(401).json({ success: false, message: 'Unauthorized' });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
});

router.get('/login/failed', (req: Request, res: Response) => {
  res.status(401).json({ success: false, message: 'failure' });
});

router.get('/logout', (req: Request, res: Response) => {
  res.clearCookie('guest');
  res.clearCookie('jwt');
  const frontendHome =
    process.env.FRONTEND_URL || 'https://chess-app-frontend-alpha.vercel.app';
  res.redirect(frontendHome);
});

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    callbackURL: `${BASE_BACKEND_URL}/auth/google/callback`,
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/login/failed',
    callbackURL: `${BASE_BACKEND_URL}/auth/google/callback`,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      const token = jwt.sign(
        { userId: user.id, name: user.name },
        JWT_SECRET,
      );

      const redirectUrl = `${CLIENT_URL}?token=${token}&id=${user.id}&name=${encodeURIComponent(
        user.name || '',
      )}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google Callback Error:', error);
      res.redirect('/auth/login/failed');
    }
  },
);

router.get(
  '/github',
  passport.authenticate('github', {
    scope: ['read:user', 'user:email'],
    callbackURL: `${BASE_BACKEND_URL}/auth/github/callback`,
  }),
);

router.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: '/auth/login/failed',
    callbackURL: `${BASE_BACKEND_URL}/auth/github/callback`,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      const token = jwt.sign(
        { userId: user.id, name: user.name },
        JWT_SECRET,
      );

      const redirectUrl = `${CLIENT_URL}?token=${token}&id=${user.id}&name=${encodeURIComponent(
        user.name || '',
      )}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('GitHub Callback Error:', error);
      res.redirect('/auth/login/failed');
    }
  },
);

export default router;
