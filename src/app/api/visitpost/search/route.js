import { NextResponse } from 'next/server';
import { createConnection } from 'mysql2/promise';

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

    const connection = await connectToDatabase();
    try {
        let query = `
    SELECT title, time, \`by\`, type FROM posts 
    WHERE (type LIKE ? OR title LIKE ?)
`
        const params = [`%${searchTerm}%`, `%${searchTerm}%`];

        if (days) {
            query += ` AND time >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`;
            params.push(days);
        }

        query += ` ORDER BY time DESC`;

        const [rows] = await connection.execute(query, params);
        await connection.end();

        return NextResponse.json(rows);
    } catch (error) {
        console.error('搜索帖子失败:', error);
        return NextResponse.json({ error: '搜索帖子失败' }, { status: 500 });
    }
}