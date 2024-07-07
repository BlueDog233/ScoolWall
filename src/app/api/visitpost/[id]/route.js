import { NextResponse } from 'next/server';
import { createConnection } from 'mysql2/promise';

async function connectToDatabase() {
    return createConnection({
        host: 'localhost',
        user: 'root',
        password: '123456',
        database: 'posts' ,
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
    const postData = await request.json(); // this would be an object with the fields to update
    const connection = await connectToDatabase();

    let query = 'UPDATE posts SET ';
    let updates = [];
    let values = [];

    for (const [field, value] of Object.entries(postData)) {
        updates.push(`\`${field}\` = ?`);
        values.push(value);
    }

    query += updates.join(', ');
    query += ' WHERE id = ?';
    values.push(id);
    try {
        await connection.execute(query, values);
        await connection.end();
        return NextResponse.json({ message: 'Post has been successfully updated.' });
    } catch (error) {
        console.error('Failed to update post:', error);
        return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 });
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