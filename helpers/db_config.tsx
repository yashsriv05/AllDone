import * as SQLite from 'expo-sqlite'

export async function db_config(db:SQLite.SQLiteDatabase)
{

    await db.execAsync(`PRAGMA journal_mode = WAL;`)

    await db.execAsync('PRAGMA foreign_keys = ON');

    await db.execAsync(`CREATE TABLE IF NOT EXISTS tag(tag_id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL UNIQUE,colour TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS note (note_id INTEGER PRIMARY KEY AUTOINCREMENT,tag_id INTEGER,title TEXT NOT NULL, content TEXT,created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY (tag_id) REFERENCES tag(tag_id));
    CREATE TABLE IF NOT EXISTS task (task_id INTEGER PRIMARY KEY AUTOINCREMENT,tag_id INTEGER,note_id INTEGER,content TEXT,completed BOOL,FOREIGN KEY (tag_id) REFERENCES tag(tag_id),FOREIGN KEY (note_id) REFERENCES note(note_id));`)
}
