import { NextResponse } from 'next/server';
import { createConnection } from 'mysql2/promise';

// 数据库连接函数
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
    const type = searchParams.get('type');

    const connection = await connectToDatabase();
    try {
        let query = 'SELECT * FROM posts';
        let params = [];

        if (type) {
            query += ' WHERE type = ?';
            params.push(type);
        }

        const [rows] = await connection.execute(query, params);
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('获取帖子失败:', error);
        return NextResponse.json({ error: '获取帖子失败' }, { status: 500 });
    }
}

export async function POST(request) {
    const connection = await connectToDatabase();
    // note that destructuring time to _, it won't be used and can't be manually specified
    let { title, content, by, type, weight = 0, expire = 2, star = 0, time: _ } = await request.json();
    console.log(222)
    if (!title || !content || !by || !type) {
        return NextResponse.json({ error: 'Title, content, by, and type are required.' }, { status: 400 });
    }

    try {
        const [result] = await connection.execute(
            'INSERT INTO posts (title, content, `by`, type, weight, expire, star, time) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
            [title, content, by, type, weight, expire, star]
        );
        await connection.end();
        return NextResponse.json({ id: result.insertId, message: 'Post has been successfully created.' }, { status: 201 });
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Error creating the post.' }, { status: 500 });
    }
}