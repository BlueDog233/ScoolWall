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
    const { title, content, by, type } = await request.json();
    try {
        const [result] = await connection.execute(
            'INSERT INTO posts (title, content, `by`, type, time) VALUES (?, ?, ?, ?, NOW())',
            [title, content, by, type]
        );
        await connection.end();
        return NextResponse.json({ id: result.insertId, message: '帖子创建成功' }, { status: 201 });
    } catch (error) {
        console.error('创建帖子失败:', error);
        return NextResponse.json({ error: '创建帖子失败' }, { status: 500 });
    }
}