import styled from 'styled-components'
import { useState, useEffect } from 'react'
import axios from 'axios'
import useAuth from '../context/useAuth'
import { Badge } from '../components/userComponents'
import { UserMinimal } from '@databaseTypes'
import { handleAxiosCatch } from '@utilities/error'

export default function PeoplePage () {
	document.title = 'People Page'
	const [searchText, setSearchText] = useState('')
	const [allUsers, setAllUsers] = useState<UserMinimal[]>([])
	const [filteredUsers, setFilteredUsers] = useState<UserMinimal[]>([])
	const { user: loggedInUser, token } = useAuth()

	useEffect(() => {
		axios.get<{ documents: UserMinimal[] }>(import.meta.env.VITE_API + '/user', {
			headers: { 'Authorization': `Bearer ${token}` }
		}).then(res => {
			setAllUsers( // Filtering out logged in user
				res.data.documents.filter((doc: UserMinimal) => doc._id !== loggedInUser!._id)
			)
		}).catch(err => handleAxiosCatch(err))
	}, [loggedInUser, token])

	useEffect(() => {
		const matchedUsers = allUsers.filter(user => {
			const words = searchText.trim().replace(/\s+/g, ' ').split(' ')
			return words.some(word =>
				user.firstname.toLowerCase().match(word) ??
				user.surname.toLowerCase().match(word)
			)
		})
		setFilteredUsers(matchedUsers)
	}, [searchText, allUsers])

	return (
		<main>
			<People>
				<h1>Find People</h1>
				<form>
					<input type="search" value={searchText} onChange={e => { setSearchText(e.target.value) }} />
					<button>Search</button>
				</form>
				{filteredUsers.map(user =>
					<Badge style={{ marginBottom: '32px' }} key={user._id} userData={user} />
				)}
			</People>
		</main>
	)
}

const People = styled.section`
	form {
		display: flex;
		height: 32px;
		margin-bottom: 20px;
	}
	input {
		height: 100%;
		width: 500px;
		max-width: 100%;
		margin-right: 10px;
	}
`
