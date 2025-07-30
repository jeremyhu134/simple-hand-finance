// pages/api/bills.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../app/lib/authOptions'; // Adjust path if needed
import { connectToDatabase } from '../../app/lib/mongodb'; // Adjust path if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.email) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    const userEmail = session.user.email;

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('billSummaries');

        // Fetch all bill summaries for the authenticated user, sorted by date
        const userBills = await collection.find({ userId: userEmail }).sort({ date: 1 }).toArray();

        return res.status(200).json(userBills);

    } catch (error: any) {
        console.error('Error fetching user bills:', error);
        return res.status(500).json({ message: 'Failed to fetch bills', error: error.message });
    }
}