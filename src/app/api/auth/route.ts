
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';


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
