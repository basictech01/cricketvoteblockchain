import { NextRequest, NextResponse } from 'next/server';
import Bet from '@/lib/model/Bet';
import { connectDB } from '@/lib/db';
import Question from '@/lib/model/Question';
import User from '@/lib/model/User';

export async function POST(request: NextRequest) {
    try {
        const { questionId, option, amount, userEmail } = await request.json();

        if (!userEmail) {
            return NextResponse.json({ message: 'User email is required' }, { status: 400 });
        }

        await connectDB();

        let user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return NextResponse.json({ message: 'Question not found' }, { status: 404 });
        }

        const bet = await Bet.create({
            question: question._id,
            user: user._id,
            option,
            amount
        });

        return NextResponse.json({ bet, message: 'Bet created' }, { status: 201 });

    } catch (error) {
        console.error('Error creating bet:', error);
        return NextResponse.json(
            { message: 'Error creating bet' },
            { status: 500 }
        );
    }
}   
