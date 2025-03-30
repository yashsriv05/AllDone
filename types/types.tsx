export type Note = {
    note_id?: number,
    tag_id?: number,
    title: string,
    content: string,
    created_at?: string,
}

export type Task = {
    task_id: number,
    tag_id?: number,
    note_id?: number,
    content: string,
    completed: boolean
}

export type Tag = {
    tag_id: number,
    name: string,
    colour: string
}