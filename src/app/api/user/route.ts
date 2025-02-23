import { connectDB } from '@/lib/db';
import User from '@/lib/model/User';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();
  const users = await User.find();
  return NextResponse.json(users, { status: 200 });
}

export async function POST(req: Request) {
  await connectDB();
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ message: 'Name, email and password are required' }, { status: 400 });
  }
  const newUser = await User.create({ name, email, password });
  return NextResponse.json(newUser, { status: 201 });
}
