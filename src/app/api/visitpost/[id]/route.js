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

export async function GET(request, { params }) {
    const { id } = params;
    const connection = await connectToDatabase();
    try {
        const [rows] = await connection.execute('SELECT * FROM posts WHERE id = ?', [id]);
        await connection.end();
        if (rows.length > 0) {
            return NextResponse.json(rows[0]);
        } else {
            return NextResponse.json({ error: '帖子未找到' }, { status: 404 });
        }
    } catch (error) {
        return NextResponse.json({ error: '获取帖子失败' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = params;
    const { title, content, by, type } = await request.json();
    const connection = await connectToDatabase();
    try {
        await connection.execute(
            'UPDATE posts SET title = ?, content = ?, `by` = ?, type = ? WHERE id = ?',
            [title, content, by, type, id]
        );
        await connection.end();
        return NextResponse.json({ message: '帖子更新成功' });
    } catch (error) {
        return NextResponse.json({ error: '更新帖子失败' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    const connection = await connectToDatabase();
    try {
        await connection.execute('DELETE FROM posts WHERE id = ?', [id]);
        await connection.end();
        return NextResponse.json({ message: '帖子删除成功' });
    } catch (error) {
        return NextResponse.json({ error: '删除帖子失败' }, { status: 500 });
    }
}