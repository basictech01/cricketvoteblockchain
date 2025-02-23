import { NextRequest, NextResponse } from 'next/server';
import Question from '@/lib/model/Question';
import { connectDB } from '@/lib/db';

export async function POST(request: NextRequest) {

    const { question, options } = await request.json();

    await connectDB();

    const newQuestion = await Question.create({ question, options });

    return NextResponse.json({ question: newQuestion }, { status: 201 });
}   