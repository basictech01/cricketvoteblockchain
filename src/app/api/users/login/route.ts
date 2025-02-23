import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/model/User';
import { connectDB } from '@/lib/db';

export async function POST(request: NextRequest) {

    const { email, name, profilePicture, provider } = await request.json();

    await connectDB();

    const user = await User.findOne({ email }).select('name email profilePicture balance');

    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
}
