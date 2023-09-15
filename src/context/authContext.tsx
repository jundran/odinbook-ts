import { createContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react'
import axios from 'axios'
import { io, Socket } from 'socket.io-client'
import { LoggedInUser, UserMinimal, Message, Notification } from '../types/database'
import { FriendStatusUpdate, ServerToClientEvents } from '../types/socket'
import { handleAxiosCatch } from '@utilities/error'

export const AuthContext = createContext<AuthContextType>({
	user: null,
	token: null,
	messages: [],
	login: () => { throw new Error('Function not implemented') },
	logout: () => { throw new Error('Function not implemented') },
	setUser: () => { throw new Error('Function not implemented') },
	setMessages: () => { throw new Error('Function not implemented') },
	sendFriendRequest: () => { throw new Error('Function not implemented') },
	removeFriend: () => { throw new Error('Function not implemented') },
	acceptFriendRequest: () => { throw new Error('Function not implemented') },
	rejectFriendRequest: () => { throw new Error('Function not implemented') },
	cancelFriendRequest: () => { throw new Error('Function not implemented') },
	clearNotification: () => { throw new Error('Function not implemented') }
})

export function AuthProvider ({children}: { children: ReactNode }) {
	const [user, setUser] = useState<LoggedInUser | null>(null)
	const [messages, setMessages] = useState<Message[]>([])
	const [token, setToken] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(true)

	useEffect(() => {
		const token = localStorage.getItem('odinbook-token')
		if (!token) { setLoading(false); return }

		setToken(token)
		axios.get<{ document: LoggedInUser }>(
			import.meta.env.VITE_API + '/user/current',
			{
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json'
				}
			}
		).then(res => { setUser(res.data.document) })
			.catch(err => handleAxiosCatch(err))
			.finally(() => { setLoading(false) })
	}, [])

	// Get new messages after setting token
	// Token can be set either from local storage on app load or from post response via login form
	useEffect(() => {
		if (!token) return
		axios.get<{ documents: Message[] }>(import.meta.env.VITE_API + '/message', {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			}
		}).then(res => { setMessages(res.data.documents) })
			.catch(err => handleAxiosCatch(err))
	}, [token])

	// SOCKET IO
	useEffect( () => {
		if (!token) return
		const socket: Socket<ServerToClientEvents>= io(import.meta.env.VITE_SERVER, { auth: { token } })

		// Incoming messages
		socket.on('userUpdate', userDocument => { setUser(userDocument) })
		socket.on('message', message => { console.log('SOCKET SERVER:', message) })
		socket.on('chatMessage', message => { setMessages(prev => [...prev, message]) })
		socket.on('friendStatusUpdate', (status: FriendStatusUpdate) => {
			let updatedFriend: (UserMinimal | null) = null
			setUser(prev => {
				if (prev === null) return null
				const updatedFriends = prev.friends.map(friend => {
					if (friend._id === status.id) {
						updatedFriend = friend
						return {
							...friend,
							isOnline: status.isOnline
						}
					} else {
						return friend
					}
				})

				if (!updatedFriend) {
					throw new Error('Friend status update sent for non friend with id' + status.id)
				}

				// Notification will be lost on refresh but this is intended for friend status updates as
				// it doesn't make sense to save such notifications to the user document in the database
				const notification: Notification = {
					_id: crypto.randomUUID(),
					runtimeOnly: true,
					type: 'friend-update',
					user: updatedFriend,
					message: status.isOnline ? ' came online' : ' went offline',
					createdAt: new Date().toISOString()
				}
				return {
					...prev,
					friends: updatedFriends,
					notifications: [...prev.notifications, notification]
				}
			})
		})

		// TESTING
		// document.addEventListener('keydown', e => {
		// 	if (e.target.matches('input')) return
		// 	else if (e.key === 'c') socket.connect()
		// 	else if (e.key === 'd') disconnectSocket()
		// })

		function disconnectSocket () {
			console.log('Disconnected from socketIO')
			socket.disconnect()
		}

		return () => { disconnectSocket() }
	}, [token])

	function sendFriendRequest (id: string) {
		axios.put<{ document: LoggedInUser }>(import.meta.env.VITE_API + '/friend/add',
			{ id },
			{ headers: { 'Authorization': `Bearer ${token}` }}
		).then(res => { if (res.status === 200) setUser(res.data.document) }
		).catch(err => handleAxiosCatch(err))
	}

	function removeFriend (id: string) {
		axios.put<{ document: LoggedInUser }>(import.meta.env.VITE_API + '/friend/remove',
			{ id },
			{ headers: { 'Authorization': `Bearer ${token}` }}
		).then(res => { if (res.status === 200) setUser(res.data.document) }
		).catch(err => handleAxiosCatch(err))
	}

	function acceptFriendRequest (id: string) {
		axios.put<{ document: LoggedInUser }>(import.meta.env.VITE_API + '/friend/accept',
			{ id },
			{ headers: { 'Authorization': `Bearer ${token}` }}
		).then(res => { if (res.status === 200) setUser(res.data.document) }
		).catch(err => handleAxiosCatch(err))
	}

	function rejectFriendRequest (id: string) {
		axios.put<{ document: LoggedInUser }>(import.meta.env.VITE_API + '/friend/reject',
			{ id },
			{ headers: { 'Authorization': `Bearer ${token}` }}
		).then(res => { if (res.status === 200) setUser(res.data.document) }
		).catch(err => handleAxiosCatch(err))
	}

	function cancelFriendRequest (id: string) {
		axios.put<{ document: LoggedInUser }>(import.meta.env.VITE_API + '/friend/cancel',
			{ id },
			{ headers: { 'Authorization': `Bearer ${token}` }}
		).then(res => { if (res.status === 200) setUser(res.data.document) }
		).catch(err => handleAxiosCatch(err))
	}

	function login (user: LoggedInUser, token: string) {
		setUser(user)
		setToken(token)
		localStorage.setItem('odinbook-token', token)
	}

	function logout () {
		setUser(null)
		setToken(null)
		localStorage.removeItem('odinbook-token')
	}

	function clearNotification (notification: Notification) {
		if (notification.runtimeOnly) {
			setUser(prev => {
				if (!prev) return null
				return {
					...prev,
					notifications: prev.notifications.filter(n => n._id !== notification._id)
				}
			})
		} else {
			axios.patch<{ document: LoggedInUser }>(import.meta.env.VITE_API + '/user/clearNotification',
				{ id: notification._id },
				{ headers: { 'Authorization': `Bearer ${token}` }}
			).then(res => { if (res.status === 200) setUser(res.data.document) }
			).catch(err => handleAxiosCatch(err))
		}
	}

	return (
		<AuthContext.Provider value={{
			user,
			token,
			messages,
			setUser,
			setMessages,
			login,
			logout,
			sendFriendRequest,
			removeFriend,
			acceptFriendRequest,
			rejectFriendRequest,
			cancelFriendRequest,
			clearNotification
		}}>
			{!loading && children}
		</AuthContext.Provider>
	)
}

type AuthContextType = {
	user: LoggedInUser | null
	token: string | null
	messages: Message[]
	login: (user: LoggedInUser, token: string) => void
	logout: () => void
	setUser: Dispatch<SetStateAction<LoggedInUser | null>>
	setMessages: Dispatch<SetStateAction<Message[]>>
	sendFriendRequest: (friendId: string) => void
	removeFriend: (friendId: string) => void
	acceptFriendRequest: (friendId: string) => void
	rejectFriendRequest: (friendId: string) => void
	cancelFriendRequest: (friendId: string) => void
	clearNotification: (notification: Notification) => void
}
