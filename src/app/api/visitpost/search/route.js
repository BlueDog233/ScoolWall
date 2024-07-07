import { NextResponse } from 'next/server';
import { createConnection } from 'mysql2/promise';
import {log} from "next/dist/server/typescript/utils";

async function connectToDatabase() {
    return createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'posts',
    });
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q');
    const days = searchParams.get('days');
    // get search filters from the URL
    const showExpired = searchParams.get('showExpired') === 'true'; // default to false if not provided
    const minWeight = parseInt(searchParams.get('minWeight')) || 0; // default to 0 if not provided
    const showOnlyStarred = searchParams.get('showOnlyStarred') === 'true'; // default to false if not provided

    const connection = await connectToDatabase();

    try {
        // Correct the expire part of query to compare the expires at date with current date
        let query = `
    SELECT id,title,time,\`by\` FROM posts 
    WHERE (type LIKE ? OR title LIKE ?) 
      AND weight >= ?
      ${showExpired ? '' : 'AND DATE_ADD(time, INTERVAL expire DAY) > NOW()'}
      ${showOnlyStarred ? 'AND star = 1' : ''}`;

        const params = [`%${searchTerm}%`, `%${searchTerm}%`, minWeight];

        query += ` ORDER BY time DESC`;

        const [rows] = await connection.execute(query, params);
        await connection.end();

        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error searching for posts:', error);
        return NextResponse.json({ error: 'Error searching for posts' }, { status: 500 });
    }
}