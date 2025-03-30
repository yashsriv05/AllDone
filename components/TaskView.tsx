import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Pressable } from "react-native"
import Checkbox from "expo-checkbox"
import * as Calendar from 'expo-calendar'
import { Task } from "@/types/types"
import * as SQLite from 'expo-sqlite'
import { db_config } from "@/helpers/db_config"
import * as crud from "@/helpers/db_crud"
import { Ionicons } from "@expo/vector-icons"
import { text } from "./styles"

const db = SQLite.openDatabaseSync('allDone')
db_config(db);

export default function TaskView ({task}:{task:Task})
{
    const [isCompleted, setIsCompleted] = useState<boolean>(task.completed)

    const handleCompletedUpdate = (val:boolean)=>{
        setIsCompleted(val);
        task.completed = val
        crud.updateTask(db, task)
    }

    return(
        <View style={styles.taskContainer}>
            <View style={styles.taskTextAndCheckbox}>
                <Checkbox
                    value={Boolean(isCompleted)}
                    onValueChange={handleCompletedUpdate}/>
                <Text style={[text.body, styles.taskText, isCompleted?styles.taskTextCompleted:null]}>{task.content}</Text>
            </View>
            <Pressable onPress={()=>Calendar.createEventInCalendarAsync({title:task.content})}>
                <Ionicons name={'calendar-clear-outline'} size={16}/>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    taskContainer:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 4,
    },
    taskTextAndCheckbox:{
        flexDirection: 'row',
        gap: 4,
    },
    taskText:{

    },
    taskTextCompleted:{
        textDecorationLine:'line-through',
        textDecorationStyle:'solid',
        color:'grey'
    }
})