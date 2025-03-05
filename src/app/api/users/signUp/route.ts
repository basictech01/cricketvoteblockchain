import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/model/User';
import { connectDB } from '@/lib/db';

export async function POST(request: NextRequest) {

    const { name, address, email, username } = await request.json();

    await connectDB();

    const user = await User.findOne({ address });

    if(user){
        return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    await User.create({ name, address, email, username });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
}

