import { useEffect, useRef, useState } from "react"
import { View, TextInput, StyleSheet, NativeSyntheticEvent, TextInputKeyPressEventData, TextInputProps } from "react-native"
import Checkbox from "expo-checkbox"
import { Task } from "@/types/types"
import * as SQLite from 'expo-sqlite'
import { db_config } from "@/helpers/db_config"
import * as crud from "@/helpers/db_crud"
import { text } from "./styles"

const db = SQLite.openDatabaseSync('allDone')
db_config(db);

export default function TaskEdit ({task, deleteTask, createTask, taskRefs}:{task:Task, deleteTask:any, createTask:any, taskRefs:any})
{
    const [taskText, setTaskText] = useState<string>(task.content)
    const [isCompleted, setIsCompleted] = useState<boolean>(task.completed)

    const handleCompletedUpdate = (val:boolean)=>{
        setIsCompleted(val);
        task.completed = val
        crud.updateTask(db, task)
    }

    const handleUpdate = () =>{
        task.completed = isCompleted;
        task.content = taskText;
        crud.updateTask(db,task)
    }

    const handleDelete = (key:string) => {
        if (taskText=='' && key == 'Backspace')
        {
            deleteTask(task.task_id)
        }
    }

    const handleCreate = () =>{
        if (taskText!='')
            createTask()
    }

    return(
        <View style={styles.taskContainer}>
            <Checkbox
                value={Boolean(isCompleted)}
                onValueChange={handleCompletedUpdate}
                style={styles.taskCheckbox}/>
            <TextInput
                style={[text.body, styles.taskText, isCompleted?styles.taskTextCompleted:null]}
                value={taskText}
                ref={ref => taskRefs.current[task.task_id] = ref}
                placeholder={'Enter your task...'}
                onChangeText={setTaskText} 
                onKeyPress={(e)=>handleDelete(e.nativeEvent.key)}
                onBlur={handleUpdate}
                onSubmitEditing={(e)=>{handleUpdate();handleCreate()}}
                onPressOut={(e)=>taskRefs.current[task.task_id].blur()}
                submitBehavior="submit"/>
        </View>
    )
}

const styles = StyleSheet.create({
    taskContainer:{
        flexDirection: 'row',
        gap: 4,
    },
    taskCheckbox:{
    },
    taskText:{
        flex: 1
    },
    taskTextCompleted:{
        textDecorationLine:'line-through',
        textDecorationStyle:'solid',
        color:'grey'
    }
})