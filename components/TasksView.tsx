import { useEffect, useRef, useState } from "react"
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native"
import Checkbox from "expo-checkbox"
import { Tag, Task } from "@/types/types"
import * as SQLite from 'expo-sqlite'
import { db_config } from "@/helpers/db_config"
import * as crud from "@/helpers/db_crud"
import { Ionicons } from "@expo/vector-icons"
import TaskView from "@/components/TaskView"
import { text } from "./styles"

const db = SQLite.openDatabaseSync('allDone')
db_config(db);

export default function TasksView ({tag, tasks}:{tag:Tag, tasks:Task[]})
{
    const [collapse, setCollapse]  = useState(false)

    const renderTask = ({item}:{item:Task}) =>{
        return (
            <TaskView task={item}/>
        )
    }

    return(
        <View style={styles.tasksContainer}>
            <Pressable onPress={()=>setCollapse(!collapse)}>
                <View style={styles.tasksContainerHeader}>
                    <Text style={[text.body,styles.tagText,{backgroundColor:tag.colour, color:'white'}]}># {tag.name}</Text>
                    {collapse?<Ionicons name={'arrow-down'} size={16}/>:<Ionicons name={'arrow-up'} size={16}/>}
                </View>
            </Pressable>
            {!collapse && tasks.map((item, index)=>{
                return(
                    <TaskView task={item} key={item.task_id}/>
                )
                })
            }
            {!collapse && tasks.length == 0?<Text style={text.body}>No tasks found for #{tag.name}</Text>:null}
        </View>
    )
}

const styles = StyleSheet.create({
    tasksContainer:{
        margin: 8,
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'white',
        shadowOffset: {
			width: 0,
			height: 2
		  },
        shadowColor: 'lightgrey',
        shadowOpacity: 1,
        shadowRadius: 7,
    },
    tagText:{
        flexDirection:'row',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 4,
    },
    tasksContainerHeader:{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    taskTextCompleted:{
        textDecorationLine:'line-through',
        textDecorationStyle:'solid',
        color:'grey'
    }
})