
export const sessionOptions = {
  cookieName: 'firebase-session',
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long_for_dev',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};
