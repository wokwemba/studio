
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { IronSession, getIronSession } from 'iron-session';

const sessionOptions = {
  cookieName: 'firebase-session',
  password: process.env.SECRET_COOKIE_PASSWORD || 'complex_password_at_least_32_characters_long_for_dev',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  },
};

async function getSession(req: NextRequest): Promise<IronSession<{ token?: string; role?: string; isAnonymous?: boolean }>> {
  const res = new NextResponse();
  return getIronSession<{ token?: string; role?: string; isAnonymous?: boolean }>(req, res, sessionOptions);
}


export async function POST(request: NextRequest) {
  try {
    const { token, role, isAnonymous } = await request.json();

    if (!token || !role) {
      return NextResponse.json({ error: 'Token and role are required' }, { status: 400 });
    }
    
    const session = await getIronSession(cookies(), sessionOptions);

    session.token = token;
    session.role = role;
    session.isAnonymous = !!isAnonymous;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session POST error:', error);
    return NextResponse.json({ error: 'Failed to set session' }, { status: 500 });
  }
}


export async function DELETE(request: NextRequest) {
    try {
      const session = await getIronSession(cookies(), sessionOptions);
      session.destroy();
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Session DELETE error:', error);
      return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 });
    }
}

    