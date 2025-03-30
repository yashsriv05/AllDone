import { StyleSheet, Pressable, View, Text, FlatList, TextInput, KeyboardAvoidingView } from 'react-native';
import { useRef, useEffect, useState, forwardRef } from 'react';
import {db_config} from '../../../helpers/db_config'
import * as crud from '../../../helpers/db_crud'
import { text } from '@/components/styles'
import * as Calendar from 'expo-calendar'
import * as SQLite from 'expo-sqlite'
import { useLocalSearchParams, Redirect, useNavigation, useRouter, Link } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tag, Note, Task } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import TaskEdit from '../../../components/TaskEdit'; 
import { rainbow } from '@/helpers/helpers';

const db = SQLite.openDatabaseSync('allDone')
db_config(db);

export default function NoteScreen() {
    const params = useLocalSearchParams() //Params for the note id
    const navigation = useNavigation() //Navigation to update header and add delete icon
    const router = useRouter() //To redirect if note is deleted
    
    const id = Number(params.note) //Note id retrieved from parameter
    //Variables to store info related to the current note
    const [title, setTitle] = useState('') //State to store title of note
    const [content, setContent] = useState('') //State to store content of note
    const [tag, setTag] = useState<Tag>({tag_id:undefined, name: '', colour: ''}) //State to store tag of note 
    const [tasks, setTasks] = useState<Task[]>([]) //Working copy of tasks
    //Helping variables
    const [tagName, setTagName]  = useState('') //Working copy of tag
    var taskRefs = useRef<Array<TextInput | undefined>>([]) //Store a reference to each task so that cursor 
                                                            //can move around on new task creation or deltetion
    var focusRef = useRef(-1) //ID of task that has to be focused
    var tagRef = useRef<TextInput>(null) //Reference to input of tag name
                                        // so that it can be blurred or focussed
    const [tagSearchResult, setTagSearchResult] = useState<Tag []>([]) //Store search results for tag
    const newDummyTask : Task = {task_id: -1, content: '', completed:false, note_id: id, tag_id: tag.tag_id} //A dummy task to create new tasks
    
    useEffect(() => { //Check if new note being requested; Otherwise, load details of requested note
        if (id == -1)
        {
            crud.createNote(db, {title:title, content:content})
            .then(val=>{return <Redirect href={`/${val.lastInsertRowId}`}/>});
        }
        else
        {
            let note = crud.readNote(db, id)[0] //Returns array
            setTasks(crud.readTasksFromNote(db, id)) //Set tasks for this note after reading
            setTitle(note.title)
            setContent(note.content)
            if (note.tag_id)
            {
                setTag(crud.readTag(db,note.tag_id))
            }
        }
    }, []);

    useEffect(() => { //Add delete icon and functionality
        navigation.setOptions({
          headerRight: () => (
            <Pressable onPress={()=>{crud.deleteNote(db, id); router.back()}}>
                <Ionicons name={'trash-outline'} size={24}/>
            </Pressable>
          ),
        });
      }, [navigation]);

    useEffect(()=>{ //When tasks are updated, updated which text input is focused
        if (focusRef.current != -1){
            setTimeout(()=>taskRefs.current[focusRef.current]?.focus(), 0);
        }
    },[tasks])


    if(tag.tag_id != undefined && !tagRef.current?.isFocused()) //If tag does not exist
    {
        crud.updateNote(db, {note_id:id, tag_id:tag.tag_id, title:title, content:content}) //Update note on every render
        if (tagName!= tag.name) //If tag names differ
        {
            setTagName(tag.name) //Set tagname 
            tasks.forEach(task=>crud.updateTask(db, {...task, tag_id:tag.tag_id})) //Update tasks with appropriate tag
        }
    }
    else if (!tagRef.current?.isFocused())
    {
        crud.updateNote(db, {note_id:id, title:title, content:content})
        if (tagName!= '') //If tag name is not empty
        {
            setTagName('') //Reset tagname
        }
    }

    const renderTask = ({item}:{item:Task}) =>{
        return (
            <TaskEdit task={item} deleteTask={deleteTask} createTask={createTask} taskRefs={taskRefs}/>
        )
    }

    const renderTag = ({item, index}:{item:Tag, index:number}) =>{
        return(
            <Pressable onPress={()=>{setTag(item);tagRef.current?.blur();}}>
                <View style={[styles.tagInputContainer, {backgroundColor: item.colour}]}>
                    <Text style={[text.subtitle, {color: 'white'}]}># {item.name}</Text>
                </View>
            </Pressable>
        )
    }

    const createTask = async () =>{
        var val = await crud.createTask(db, newDummyTask) //Write
        var tasks = crud.readTasksFromNote(db, id) //Reread tasks
        focusRef.current = val.lastInsertRowId
        setTasks(tasks) //Rerender
    }

    const createTag = async () => {
        var newTag = {name: tagName, colour: rainbow()}
        var val = await crud.createTag(db, newTag)
        setTag(crud.readTag(db, val.lastInsertRowId))
        tagRef.current?.blur()
    }

    const deleteTask = (id:number) => {
        crud.deleteTask(db, id)
        if (tasks.length > 1)
        {
            let currentTask = tasks.find(val=>val.task_id == id)
            let prevTaskIdx = currentTask == undefined?-1:tasks.indexOf(currentTask)-1

            focusRef.current = tasks[prevTaskIdx]?.task_id
        }
        else
            focusRef.current = -1
        taskRefs.current[id] = undefined
        setTasks(tasks.filter(item=>item.task_id!=id))
    }

    const deleteTag = (key:string) =>{
        if (key == 'Backspace' && tag.tag_id != undefined){
            setTag({tag_id:undefined, name: '', colour: ''})
            crud.updateNote(db, {note_id:id, title:title, content:content, tag_id:undefined})
            tasks.forEach(task=>crud.updateTask(db, {...task, tag_id:undefined})) //Update task and remove tag
        }
    }

    const updateTagSearchResults = (val:string) => {
        if (val!='')
            setTagSearchResult(crud.searchTags(db, val))
        else
            setTagSearchResult([])
        setTagName(val);
    }
    return (
        <View style={styles.container}>
            <View style={styles.noteArea}>
                <TextInput
                    style={[text.heading1, styles.title]} 
                    placeholder='Title' 
                    value ={title} 
                    onChangeText={setTitle}
                    autoFocus={false}/>
                <View style={styles.tagContainer}>
                    <View style={[styles.tagInputContainer, {backgroundColor:tag.colour}]}>
                        <Text style={[text.subtitle,tag.tag_id!=undefined?styles.tagInput:null]}># </Text>
                        <TextInput placeholder='Tag'
                                    style={[text.subtitle,tag.tag_id!=undefined?styles.tagInput:null]}
                                    value={tagName}
                                    ref = {tagRef}
                                    onChangeText={updateTagSearchResults}
                                    onKeyPress={(e)=>{deleteTag(e.nativeEvent.key)}}
                        />
                    </View>
                    {tagName!='' && tag.tag_id == undefined && tagRef.current?.isFocused() && 
                    <View style={styles.tagSearchResultList}>
                        <FlatList
                        data={tagSearchResult}
                        renderItem={renderTag}
                        scrollEnabled={false}
                        keyExtractor={(item)=>String(item.tag_id)}
                        contentContainerStyle={{flex:1, gap: 4}}/>
                    {!crud.matchTag(db, tagName) && 
                        <Pressable onPress={createTag}>
                            <Text style={[text.subtitle, {marginTop:4}]}>Add # {tagName}</Text>
                        </Pressable>
                    }
                    </View>
                    }
                </View>
                <View style={styles.noteContainer}>
                    <TextInput placeholder='Note'
                                style={[text.body, styles.note]}
                                value={content} 
                                onChangeText={setContent} 
                                multiline={true}/>
                </View>
            </View>
            
            <KeyboardAvoidingView style={styles.taskArea} behavior='padding' keyboardVerticalOffset={100}>
                <Text style={text.heading2}>Tasks</Text>
                <FlatList
                    data = {tasks}
                    renderItem={renderTask}
                    contentContainerStyle={styles.taskList}
                    keyExtractor={(item) => String(item.task_id)}/>
                <Pressable onPress={createTask} style={styles.newTaskButtonContainer}>
                    <View style={styles.newTaskButton}>
                        <Ionicons name='add-circle-outline' size={24}/>
                        <Text style={text.heading2}>Create a Task</Text>
                    </View>
                </Pressable>
            </KeyboardAvoidingView>
        </View>
    );
}
var font = 'Times New Roman'

const styles = StyleSheet.create({
    container:
    {
        flex: 1,
        flexDirection:'column',
        backgroundColor: '#F9F9F9',
    },
    noteArea:
    {
        flex: 7,
        margin: 8,
    },
    title:{
        marginTop: 8,
    },
    tagContainer:{
        flexDirection:'row'
    },
    tagInputContainer:{
        flexDirection:'row',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 4,
        alignSelf: 'flex-start',
    },
    tagInput:{
        color:'white',
    },
    tagSearchResultList:{
        position: 'absolute',
        top: 36,
        left: 0,
        width: '100%',
        zIndex: 10,
        elevation: 10,
        backgroundColor:'white',
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8
    },
    tagSearchResult:{
        flexDirection:'row',
    },
    noteContainer:{
        borderTopColor: '#222222',
        borderTopWidth: 1,
        marginTop: 8,
        height: '85%',
    },
    note:{
        paddingTop: 4,
        marginBottom: 16,
        height: '100%',
    },
    taskArea:{
        backgroundColor: 'white',
        flex: 3,
        padding: 8,
        margin: 8,
        gap: 4,
        borderRadius: 8,
        shadowOffset: {
			width: 0,
			height: 2
		  },
        shadowColor: 'lightgrey',
        shadowOpacity: 1,
        shadowRadius: 7,
    },
    taskList:{
        flexGrow: 1,
        gap: 4,
    },
    newTaskButtonContainer:{
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    newTaskButton:{
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
});
