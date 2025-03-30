import { SQLiteDatabase } from "expo-sqlite";
import { Note, Tag, Task } from '../types/types'

//Create
export function createNote(db:SQLiteDatabase, newNote:Note)
{
    // console.log(newNote)
    return db.runAsync(`INSERT INTO note (title, content) VALUES (?, ?)`, newNote.title, newNote.content)
}

export function createTag(db:SQLiteDatabase, newTag:Tag)
{
    // console.log(newTag)
    return db.runAsync('INSERT INTO tag (name, colour) VALUES (?, ?)', newTag.name, newTag.colour)
}

export function createTask(db:SQLiteDatabase, newTask:Task)
{
    if (newTask.tag_id && newTask.note_id)
        return db.runAsync('INSERT INTO task (tag_id, note_id, content, completed) VALUES (?, ?, ?, ?)', newTask.tag_id, newTask.note_id, newTask.content, newTask.completed)
    if (newTask.tag_id)
        return db.runAsync('INSERT INTO task (tag_id, content, completed) VALUES (?, ?, ?)', newTask.tag_id, newTask.content, newTask.completed)
    if (newTask.note_id)
        return db.runAsync('INSERT INTO task (note_id, content, completed) VALUES (?, ?, ?)', newTask.note_id, newTask.content, newTask.completed)
    else
        return db.runAsync('INSERT INTO task (content, completed) VALUES (?, ?)', newTask.content, newTask.completed)
}

//Read
export function readNotes(db:SQLiteDatabase)
{
    const allNotes : Note [] = db.getAllSync('SELECT * FROM note')
    return allNotes;
}
export function readNote(db:SQLiteDatabase, id:number)
{
    const note : Note [] = db.getAllSync('SELECT * FROM note WHERE note_id = ?', String(id))
    return note;
}

export function searchNotes(db:SQLiteDatabase, search:string)
{
    search = '%' + search + '%'
    const notes: Note [] = db.getAllSync("SELECT * FROM note WHERE title LIKE ?",search)
    return notes;
}

export function readTags(db:SQLiteDatabase)
{
    const allTags: Tag [] = db.getAllSync('SELECT * FROM tag')
    return allTags;
}

export function readTag(db:SQLiteDatabase, id:number)
{
    const tag: Tag [] = db.getAllSync('SELECT * FROM tag WHERE tag_id = ?', String(id))
    return tag[0];
}

export function searchTags(db:SQLiteDatabase, search:string)
{
    search = '%' + search + '%'
    const tags: Tag [] = db.getAllSync("SELECT * FROM tag WHERE name LIKE ?",search)
    return tags;
}

export function searchTag(db:SQLiteDatabase, search:string)
{
    const tags: Tag [] = db.getAllSync("SELECT * FROM tag WHERE name = ?",search)
    return tags[0];
}

export function matchTag(db:SQLiteDatabase, search:string)
{
    const tag: Tag [] = db.getAllSync('SELECT * FROM tag WHERE name = ?', search)
    if (tag.length != 0)
        return tag[0].tag_id
    else
        return 0
}

export function readTasks(db:SQLiteDatabase)
{
    const allTasks: Task [] = db.getAllSync('SELECT * FROM task')
    return allTasks;
}
export function readTasksFromNote(db:SQLiteDatabase, note_id:number)
{
    const noteTasks: Task [] = db.getAllSync('SELECT * FROM task WHERE note_id = ?',String(note_id))
    return noteTasks
}

//Update
export function updateNote(db:SQLiteDatabase, newNote:Note)
{
    if (newNote.tag_id && newNote.note_id)
        db.runAsync(`UPDATE note SET tag_id = ?, title = ?, content = ? WHERE note_id = ?`, newNote.tag_id, newNote.title, newNote.content, newNote.note_id)
    else if (newNote.note_id)
        db.runAsync(`UPDATE note SET tag_id = ?, title = ?, content = ? WHERE note_id = ?`, null, newNote.title, newNote.content, newNote.note_id)
}
export function updateTask(db:SQLiteDatabase, newTask:Task)
{
    if (newTask.task_id && newTask.tag_id)
        return db.runAsync('UPDATE task SET tag_id = ?, content = ?, completed = ? WHERE task_id = ?', newTask.tag_id, newTask.content, newTask.completed, newTask.task_id)
    else if (newTask.task_id)
        return db.runAsync('UPDATE task SET tag_id =?, content = ?, completed = ? WHERE task_id = ? ', null, newTask.content, newTask.completed, newTask.task_id)
}

//Delete
export function deleteTask(db:SQLiteDatabase, task_id:number)
{
    return db.runAsync('DELETE FROM task WHERE task_id = ?',String(task_id))
}

export function deleteNote(db:SQLiteDatabase, id:number)
{
    db.runSync('DELETE FROM task WHERE note_id = ?',String(id))
    return db.runSync('DELETE FROM note WHERE note_id = ?',String(id))
}