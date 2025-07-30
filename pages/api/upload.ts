
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { Fields, Files, File } from 'formidable'
import { connectToDatabase } from '../../app/lib/mongodb' // Import the MongoDB utility
import { getServerSession } from 'next-auth' // Import getServerSession
import { authOptions } from '../../app/lib/authOptions'
import fs from 'fs'


// Tell Next.js NOT to parse the body (formidable needs raw request stream)
export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    // --- NEW: Get User Session ---
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user || !session.user.email) {
        // If no session or user email, deny access or return an error
        return res.status(401).json({ message: 'Authentication required' });
    }

    const userEmail = session.user.email;

    const form = formidable({
        multiples: true,
        keepExtensions: true,
    })

    form.parse(req, async (err, fields: Fields, files: Files) => {
        if (err) {
            console.error('Form parse error:', err)
            return res.status(500).json({ message: 'Error parsing form data' })
        }

        let uploadedFiles = files.file

        if (!uploadedFiles) {
            return res.status(400).json({ message: 'No files uploaded' })
        }

        // Normalize to array if only one file uploaded
        if (!Array.isArray(uploadedFiles)) {
            uploadedFiles = [uploadedFiles]
        }

        try {
            // Read and encode all files as base64 strings
            const filesData = uploadedFiles.map((file: File) => {
                const buffer = fs.readFileSync(file.filepath)
                return {
                    filename: file.originalFilename || 'unnamed',
                    mimetype: file.mimetype || 'application/octet-stream',
                    content: buffer.toString('base64'),
                }
            })

            // Prepare payload to send to Lambda
            const payload = { files: filesData }

            // Send POST request to your Lambda URL
            const lambdaRes = await fetch('https://kjmblsz2x6mvkll4zhjqtnhjfa0tvvrk.lambda-url.us-east-2.on.aws/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!lambdaRes.ok) {
                const errorText = await lambdaRes.text()
                console.error('Lambda call failed:', errorText)
                return res.status(500).json({ message: 'Lambda call failed', details: errorText })
            }

            const lambdaData = await lambdaRes.json()
            let billSummary = lambdaData.summary; // This is the JSON object you want to save

            if (typeof billSummary === 'string') {
                try {
                    billSummary = JSON.parse(billSummary);
                } catch (parseError) {
                    console.error('Error parsing billSummary string to JSON:', parseError);
                    console.warn('Lambda summary was a string but not valid JSON, skipping DB save:', billSummary);
                    return res.status(500).json({ message: 'Internal server error: Invalid JSON from Lambda' });
                }
            }
            // --- NEW: Connect to MongoDB and save the summary with user identifier ---
            if (billSummary && typeof billSummary === 'object' && !Array.isArray(billSummary)) {
                try {
                    const { db } = await connectToDatabase();
                    const collection = db.collection('billSummaries'); // Choose a collection name

                    const docToInsert = {
                        userId: userEmail, // Store the user's email as the identifier
                        // You could also use session.user.id if your adapter populates it and it's unique
                        ...billSummary,
                        uploadedAt: new Date(),
                        originalFilenames: uploadedFiles.map(f => f.originalFilename || 'unnamed'),
                    };

                    const result = await collection.insertOne(docToInsert);
                    console.log(`Document inserted with _id: ${result.insertedId} for user: ${userEmail}`);
                } catch (mongoError: any) {
                    console.error('MongoDB insert error:', mongoError);
                    return res.status(500).json({
                        message: 'Error saving data to database',
                        lambdaResponse: lambdaData, // Still send lambda response
                        dbError: mongoError.message
                    });
                }
            } else {
                console.warn('Lambda summary was not a valid JSON object, skipping DB save:', billSummary);
            }
            // --- END NEW ---

            return res.status(200).json({
                message: 'Files uploaded and forwarded to Lambda successfully',
                lambdaResponse: lambdaData,
                redirectTo: '/dashboard',
            })
        } catch (error) {
            console.error('Error processing files or calling Lambda:', error)
            return res.status(500).json({ message: 'Server error forwarding files' })
        }
    })
}