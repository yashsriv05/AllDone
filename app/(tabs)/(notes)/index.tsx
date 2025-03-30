import { StyleSheet, Pressable, View, Text, FlatList, TextInput } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import {db_config} from '../../../helpers/db_config'
import * as crud from '../../../helpers/db_crud'
import { text } from '@/components/styles'
import * as Calendar from 'expo-calendar'
import * as SQLite from 'expo-sqlite'
import { Link, useFocusEffect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tag, Note } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';

const db = SQLite.openDatabaseSync('allDone')


export default function HomeScreen() {
	const [allNotes, setAllNotes] = useState<Note[]>(crud.readNotes(db)) //State to store all notes in the DB
	const [searchTerm, setSearchTerm] = useState('')//State to store search bar input
	const allTags : Tag[] = crud.readTags(db)
	const [filterTags, setFilterTags] = useState<number[]>([])

	useFocusEffect(useCallback(()=>{ //Update list of notes every time screen is focused
		setAllNotes(crud.readNotes(db))
		return () => {}
	},[]))

	useEffect(() => { //Initial setup - get calendar permissions
	(async () => {

		await db_config(db); 
		var { status } = await Calendar.requestCalendarPermissionsAsync();
		while (status != 'granted')
		{
			status  = await Calendar.requestCalendarPermissionsAsync().then(val=>{return val.status});
		}
	})();
	}, []);

	useEffect(()=>{
		if (filterTags.length != 0)
			{
				var notes = crud.readNotes(db)
				setAllNotes(notes.filter(item=>{if(item.tag_id) return filterTags.includes(item.tag_id); else return false}))
			}
		else
			setAllNotes(crud.readNotes(db))
	},[filterTags])

	const FilterTag = ({tag}:{tag:Tag}) =>{
		return(
			<Pressable
				onPress={()=>{if (filterTags.includes(tag.tag_id))
								setFilterTags(filterTags.filter(item=>item != tag.tag_id))
							  else
							  	setFilterTags(filterTags.concat(tag.tag_id))}}>
				<View style={[styles.tagContainer, {backgroundColor: tag.colour}, filterTags.includes(tag.tag_id)?styles.selectedFilter:null]}>
					<Text style={[text.subtitle, {color: 'white'}]}># {tag.name}</Text>
				</View>
			</Pressable>
		)
	}

	const NotePreview = ({note}:{note:Note}) =>{ //Functional component for notecards seen on home screen
		var tag = undefined
		if(note.tag_id)
			tag = allTags.find(item=>item.tag_id==note.tag_id)

		return(
			<Link href={`/${note.note_id}`} asChild>
				<Pressable style={styles.notePreview}>
					<View>
						<Text style={[text.heading2, styles.notePreviewText]}>
						{note.title}
						</Text>
						{tag!=undefined && <Text style={[text.subtitle, styles.tag,{backgroundColor: tag.colour, color: 'white'}]}># {tag.name}</Text>}
						<Text style={[text.body, styles.notePreviewText]} numberOfLines={5}>
						{note.content}
						</Text>
					</View>
				</Pressable>
			</Link>
		)
	}

	const handleSearch = (val:string) =>{
		setSearchTerm(val)
		setAllNotes(crud.searchNotes(db, val))
	}

	const deleteSearch = (key:string) => {
		if (key == 'Backspace' && searchTerm.length == 1)
			{
				setAllNotes(crud.readNotes(db))
			}
	}

	return (
		<SafeAreaView style={styles.container} edges={['top','left','right']}>
			<Text style={[text.heading1, styles.pageTitle]}>Notes</Text>
			<View style={styles.searchBar}>
				<Ionicons name={'search'} size={16}/>
				<TextInput
					style={text.subtitle}
					value={searchTerm}
					placeholder='Search by Title' 
					onChangeText={handleSearch} 
					onKeyPress={(e)=>deleteSearch(e.nativeEvent.key)}/>
			</View>
			{searchTerm!='' && 
			<Text style={[text.heading2,{margin:8}]}>{allNotes.length} Results for "{searchTerm}"</Text>}
			<View style={styles.filterTags}>
				<Pressable onPress={()=>setFilterTags([])}>
					<Ionicons name={'refresh'} size={16}/>
				</Pressable>
				<FlatList
					data = {allTags}
					renderItem={({item})=><FilterTag tag={item}/>}
					horizontal={true}
					scrollEnabled={true}
				/>
			</View>
			<FlatList
				data = {allNotes.toReversed()}
				renderItem = {({item})=><NotePreview note={item}/>}
				numColumns={2}
				scrollEnabled={true}
				contentContainerStyle={styles.notes}
				showsVerticalScrollIndicator={true}
			/>
			<Link href='/-1' style={styles.newNoteButtonContainer} asChild>
				<Pressable>
				<View style={styles.newNoteButton}>
					<Ionicons name='add-circle-outline' size={24}/>
					<Text style={text.heading2}>Create a Note...</Text>
				</View>
				</Pressable>
			</Link>
		</SafeAreaView>
	);
}

var font = 'Times New Roman'

const styles = StyleSheet.create({
	container:
	{
		flex: 1,
		backgroundColor:'#F9F9F9',
	},
	pageTitle:{
		margin: 8
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
	filterTags:{
		flexDirection:'row',
		alignItems: 'center',
		gap: 8,
		marginHorizontal: 8
	},
	tagContainer:{
        flexDirection:'row',
        borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 4,
		margin: 4,
        alignSelf: 'flex-start'
    },
	selectedFilter:{
		borderWidth: 1,
		borderColor: '#747474'
	},
	notes:
	{
		paddingBottom: 16,
		flex: 0.9
	},
	newNoteButtonContainer:
	{
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'white',
		flex: 0.1,
		margin: 16,
		borderRadius: 8,
		shadowOffset: {
			width: 0,
			height: 2
		  },
		  shadowColor: 'lightgrey',
		  shadowOpacity: 0.4,
		  shadowRadius: 7,
	},
	newNoteButton:
	{
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
		flex: 1,
	},
	notePreview:
	{
		// borderWidth: 1,
		// borderColor: '#cacaca',
		borderRadius: 8,
		width: '45%',
		padding: 8,
		marginHorizontal:'2.5%',
		marginVertical: 8,
		backgroundColor: 'white',
		shadowOffset: {
			width: 0,
			height: 2
		  },
		  shadowColor: 'lightgrey',
		  shadowOpacity: 0.2,
		  shadowRadius: 3,
	},
	tag:{
		borderRadius: 4,
        paddingVertical: 2,
        paddingHorizontal: 4,
        marginTop: 4,
        alignSelf: 'flex-start'
	},
	notePreviewText:
	{
		color: '#222222',
	},
});
