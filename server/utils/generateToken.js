const jwt = require('jsonwebtoken');
const parseDuration = require('./parseDuration');

const COOKIE_NAME = 'token';
const expiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

const cookieOptions = () => {
  const sameSite = (process.env.COOKIE_SAMESITE || 'lax').toLowerCase();
  return {
    httpOnly: true, // JavaScript in the browser can never read the token
    secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
    sameSite,
    path: '/',
  };
};

const signToken = (userId) => jwt.sign({ id: String(userId) }, process.env.JWT_SECRET, { expiresIn: expiresIn() });

const setAuthCookie = (res, userId) =>
  res.cookie(COOKIE_NAME, signToken(userId), { ...cookieOptions(), maxAge: parseDuration(expiresIn()) });

const clearAuthCookie = (res) => res.clearCookie(COOKIE_NAME, cookieOptions());

module.exports = { COOKIE_NAME, signToken, setAuthCookie, clearAuthCookie };
