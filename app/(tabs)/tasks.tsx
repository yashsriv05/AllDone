import { StyleSheet, Image, Text, View, ScrollView, FlatList, SafeAreaView, TextInput, Pressable } from 'react-native';
import * as SQLite from 'expo-sqlite'
import * as Calendar from 'expo-calendar'
import {db_config} from '@/helpers/db_config'
import * as crud from '@/helpers/db_crud'
import { text } from '@/components/styles';
import { useCallback, useEffect, useState } from 'react';
import { Tag, Task } from '@/types/types';
import TasksView from '@/components/TasksView';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const db = SQLite.openDatabaseSync('allDone')
db_config(db);

export default function Tasks() {
  const [tags, setTags] = useState<Tag[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [openOrClosed, setOpenOrClosed] = useState<boolean | undefined>(undefined)

  useFocusEffect(useCallback(()=>{
    setTags(crud.readTags(db))
    setTasks(crud.readTasks(db))
      return () => {}
    },[]))

    const handleSearch = (val:string) =>{
        setSearchTerm(val)
        setTags(crud.searchTags(db, val))
    }
    
      const deleteSearch = (key:string) => {
        if (key == 'Backspace' && searchTerm.length == 1)
          {
            setTags(crud.readTags(db))
          }
      }

  return (
    <SafeAreaView style={styles.container}>
        <Text style={[text.heading1, styles.pageTitle]}>Tasks</Text>
        <View style={styles.searchBar}>
				<Ionicons name={'search'} size={16}/>
				<TextInput
					style={text.subtitle}
					value={searchTerm}
					placeholder='Search by Tag' 
					onChangeText={handleSearch} 
					onKeyPress={(e)=>deleteSearch(e.nativeEvent.key)}/>
			</View>
       <View style={styles.filters}>
          <Pressable onPress={()=>setOpenOrClosed(undefined)}>
            <Ionicons name={'refresh'} size={16}/>
          </Pressable>
          <Pressable onPress={()=>{setOpenOrClosed(false)}}>
              <View>
                <Text style={[text.subtitle, styles.filter, openOrClosed === false?styles.selectedFilter:null]}>Open</Text>
              </View>
          </Pressable>
          <Pressable onPress={()=>{setOpenOrClosed(true)}}>
              <View>
                <Text style={[text.subtitle, styles.filter, openOrClosed === true?styles.selectedFilter:null]}>Closed</Text>
              </View>
          </Pressable>
        </View>
			{searchTerm!='' && 
			<Text style={[text.heading2,{margin:8}]}>{tags.length} Results for "{searchTerm}"</Text>}
        <ScrollView>
            {tags.map((item, index) => {
                let tagTasks = tasks.filter(task=>item.tag_id == task.tag_id)
                tagTasks = tagTasks.filter(task=>openOrClosed!=undefined?task.completed==openOrClosed:true)
                return (
                <TasksView tag={item} tasks={tagTasks} key={item.tag_id}/>
                    );
            })}
        </ScrollView>
        {tags.length == 0 && <Text style={[text.heading2,{textAlign:'center', textAlignVertical:'center'}]}>Tag a Note First!</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9',
    flex: 1,
  },
  pageTitle:{
    margin: 8,
  },
  searchBar:{
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: 'white',
		paddingVertical: 12,
		paddingHorizontal: 4,
		borderRadius: 8,
		margin: 8,
		gap: 4,
		shadowOffset: {
			width: 0,
			height: 2
		  },
		  shadowColor: 'lightgrey',
		  shadowOpacity: 0.4,
		  shadowRadius: 7,
	},
    filters:{
		flexDirection:'row',
		alignItems: 'center',
		gap: 8,
		marginHorizontal: 8
	},
    filter:{
        flexDirection:'row',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 4,
		margin: 4,
        alignSelf: 'flex-start',
        backgroundColor: 'white',
    },
    selectedFilter:{
		borderWidth: 1,
		borderColor: '#747474'
	},
});
