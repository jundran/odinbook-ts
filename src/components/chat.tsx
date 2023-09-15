import styled from 'styled-components'
import { useEffect, useRef, useState, FormEvent } from 'react'
import axios from 'axios'
import useAuth from '../context/useAuth'
import MessageComponent from './message'
import { handleAxiosCatch } from '@utilities/error'
import { MOBILE, headerBlue } from '../styles/sharedComponentStyles'
import { Message, UserMinimal } from '@databaseTypes'

export default function Chat ({ activeFriendId }: { activeFriendId: string | undefined }) {
	const [friend, setFriend] = useState<UserMinimal | null>(null)
	const [filteredMessages, setFitleredMessages] = useState<Message[]>([])
	const [sending, setSending] = useState<boolean>(false)
	const [messagesWaiting, setMessagesWaiting] = useState<boolean>(false)
	const { user: loggedInUser, token, messages, setMessages } = useAuth()
	const user = loggedInUser!
	const chatWindowRef = useRef<HTMLInputElement>(null)
	const chatWindowIsAtBottom = useRef<boolean>(true)

	// Set friend on selection
	useEffect(() => {
		if (!activeFriendId) return
		chatWindowRef.current!.scrollTop = chatWindowRef.current!.scrollHeight
		chatWindowIsAtBottom.current = true // reset after friend selection change
		const friend = user.friends.find(f => f._id === activeFriendId)
		if (friend) setFriend(friend)
		else throw new Error(`Friend with id ${activeFriendId} not found`)
	}, [activeFriendId, user.friends])

	// Filter messages when they arrive
	useEffect(() => {
		if (!friend) return
		// Check if chat window is at the bottom
		const {scrollHeight, scrollTop, clientHeight} = chatWindowRef.current!
		const difference = scrollHeight - (scrollTop + clientHeight)
		chatWindowIsAtBottom.current = difference < 1  // Calculation on chrome can be off by .5
		// console.log(scrollHeight, scrollTop, clientHeight, difference, chatWindowIsAtBottom.current)

		setFitleredMessages(messages.filter(message =>
			(message.sender === user._id && message.recipient === friend._id) ||
			(message.sender === friend._id && message.recipient === user._id))
		)
	}, [messages, friend, user._id])

	// Mark messages as read when they are filtered and rendered
	useEffect(() => {
		if (!friend) return
		const unreadMessagesIds = filteredMessages
			.filter(message => message.sender !== user._id && !message.isRead)
			.map(message => message._id)

		if (unreadMessagesIds.length) {
			axios.patch(import.meta.env.VITE_API + '/message/read',
				{ ids: unreadMessagesIds },
				{ headers: { 'Authorization': `Bearer ${token}` }}
			).then(res => {
				if (res.status === 204) {
					setMessages(messages => messages.map(m => {
						if (m.sender === friend._id) return { ...m, isRead: true }
						else return m
					}))
				}
			}).catch(err => { console.log(err) })
		}
	}, [filteredMessages, friend, setMessages, token, user._id])

	// Scroll chat if it's at the bottom else notify of waiting messages
	useEffect(() => {
		if (chatWindowIsAtBottom.current) {
			chatWindowRef.current!.scrollTop = chatWindowRef.current!.scrollHeight
		}
		else setMessagesWaiting(true)
	}, [filteredMessages])

	function handleSubmit (e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		// Below checks are to satisfy typescript and verify internal logic for this component
		if (!friend) throw new Error(
			'Sending chat message without selected friend. Send button should be disabled.'
		)
		if (!(e.currentTarget.text instanceof HTMLInputElement)) {
			throw new Error('Chat input HTMLInputElement not found')
		}

		const text = e.currentTarget.text.value.trim()
		if (!text) return
		setSending(true)
		chatWindowRef.current!.scrollTop = chatWindowRef.current!.scrollHeight
		e.currentTarget.text.value = ''
		axios.post(import.meta.env.VITE_API + '/message', {
			sender: user._id,
			recipient: friend._id,
			text
		}, {
			headers: { 'Authorization': `Bearer ${token}` }
		}).finally(() => {
			setSending(false)
			// Do not set message here because it will be returned by socketIO to keep all clients in sync
		}).catch(err => handleAxiosCatch(err))
	}

	function handleClick () {
		chatWindowRef.current!.scrollTop = chatWindowRef.current!.scrollHeight
		setMessagesWaiting(false)
	}

	function handleScroll () {
		// setMessagesWaiting(false) if chat window is scrolled to the bottom
		const {scrollHeight, scrollTop, clientHeight} = chatWindowRef.current!
		const difference = scrollHeight - (scrollTop + clientHeight)
		if (difference < 1) setMessagesWaiting(false)
	}

	function getPlaceHolder () {
		if (friend && friend.isOnline) return `Send a message to ${friend.fullname}`
		else if (friend) return `Send <offline> message to ${friend.fullname}`
		else return 'Select friend to type a message'
	}

	return (
		<Container className='Chat'>
			<Title $isOnline={friend?.isOnline ?? false}>
				{friend ?
					<>
						<span>Chatting with </span>
						<span className='name'>{friend.fullname} </span>
						(<span className='status'>{friend.isOnline ? 'Online' : 'Offline'}</span>)
					</> :
					'Select friend to chat with'
				}
			</Title>
			<ChatWindow ref={chatWindowRef} onScroll={handleScroll}>
				{friend && filteredMessages.map(message =>
					<MessageComponent key={message._id} data={message} friend={friend} />)
				}
			</ChatWindow>
			{messagesWaiting &&
				<Status onClick={handleClick}>Messages Waiting</Status>
			}
			<ChatInput onSubmit={handleSubmit}>
				<input name='text' disabled={sending || !friend} placeholder={getPlaceHolder()} />
				<button disabled={sending || !friend}>Send</button>
			</ChatInput>
		</Container>
	)
}

const Container = styled.section`
	flex-grow: 1;
	border: 5px solid;
	display: flex;
	flex-direction: column;
	overflow: auto;
`

const Title = styled.p<{ $isOnline: boolean }>`
	margin: 0;
	padding: 15px;
	font-size: .9rem;
	font-weight: 600;
	border-bottom: 1px solid;
	span.name { color: teal; }
	span.status { color: ${props => props.$isOnline ? 'green' : 'grey'} }
`

const ChatWindow = styled.div`
	flex-grow: 1;
	overflow: auto;
	display: flex;
	flex-direction: column;
	padding: 10px;
	gap: 10px;
`

const Status = styled.button`
	background: none;
	border: none;
	border-top: 1px solid #222;
	padding: 10px;
	text-align: center;
	font-weight: 600;
	font-size: .8rem;
	&:hover { color: navy; }
`

const ChatInput = styled.form`
	display: flex;
	border-top: 1px solid;
	input {
		overflow: hidden;
		flex-grow: 1;
		font-size: 1rem;
		padding: 10px;
		border: none;
		outline: none;
		&:disabled { opacity: 1; }
	}
	@media (max-width: ${MOBILE}) {
		input::placeholder { font-size: .8rem; }
	}
	button {
		border: none;
		background: ${headerBlue};
		padding: 0 10px;
		outline-offset: -3px;
		&:hover, &:focus { background: #3e91ad; }
	}
`
