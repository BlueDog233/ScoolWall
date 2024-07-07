import {createConnection} from "mysql2/promise";
import {NextResponse} from "next/server";

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

    const connection = await connectToDatabase();
    try {
        let query = 'SELECT DISTINCT type FROM posts';
        const [rows] = await connection.execute(query);
        await connection.end();
        let types=[]
        rows.forEach(x=>types.push(x['type']))
        return NextResponse.json(types);
    } catch (error) {
        console.error('获取帖子类型失败:', error);
        return NextResponse.json({ error: '获取帖子类型失败' }, { status: 500 });
    }
}