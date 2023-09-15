import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useAuth from '../context/useAuth'
import { getTimeFrame } from '../utilities/time'
import { headerBlue, MOBILE } from '../styles/sharedComponentStyles'
import friendsIcon from '../assets/friends.svg'
import notificationsIcon from '../assets/notifications.svg'
import notificationsPendingIcon from '../assets/notifications-pending.svg'
import chatIcon from '../assets/chat.svg'

export function ChatIcon () {
	const { user: loggedInUser, messages } = useAuth()
	const location = useLocation()
	const user = loggedInUser!

	const unreadMessageCount = messages.filter(m => m.sender !== user._id && !m.isRead).length || ''

	return (
		<MenuItemContainer>
			<Link to='/chat'>
				<HeaderIcon src={chatIcon} alt='' />
				{location.pathname !== '/chat' && <span>{unreadMessageCount}</span>}
			</Link>
		</MenuItemContainer>
	)
}

export function Friends () {
	const [showDropdown, setShowDropdown] = useState(false)
	const { user: loggedInUser, acceptFriendRequest, rejectFriendRequest } = useAuth()
	const user = loggedInUser!
	const hasItems = user.incomingFriendRequests.length ? user.incomingFriendRequests.length : false

	// Close friends if user clicks outside the friends dropdown
	useEffect(() => {
		function callback (e: MouseEvent) {
			const target = e.target as Element
			if ( // See Notifications component useEffect below for explanation
				document.getElementById('friends-menu-item-container')!.contains(target) ||
				target.classList.contains('menu-item-response-button')
			) return

			setShowDropdown(false)
		}
		window.addEventListener('click', callback)
		return () => { window.removeEventListener('click', callback) }
	}, [])

	return (
		<MenuItemContainer id='friends-menu-item-container'>
			<button
				className='icon-button'
				aria-label='Incoming friend requests'
				onClick={() => { setShowDropdown(prev => !prev) }}
			>
				<HeaderIcon src={friendsIcon} alt='' />
				{hasItems && <span>{hasItems}</span>}
			</button>
			{showDropdown &&
				<DropdownContainer>
					<DropdownTitle>Incoming Friend Requests</DropdownTitle>
					<Items>
						{user.incomingFriendRequests.map(requestingUser =>
							<Item key={requestingUser._id}>
								<p>
									<Link to={`/user/${requestingUser._id}`}>{requestingUser.fullname}</Link>
									<span> sent you a friend request</span>
								</p>
								<div className='buttons'>
									<ResponseButton
										className='menu-item-response-button'
										onClick={() => {
											if (user.incomingFriendRequests.length === 1) setShowDropdown(false)
											acceptFriendRequest(requestingUser._id)
										}}>
										Accept
									</ResponseButton>
									<ResponseButton
										className='menu-item-response-button reject'
										onClick={() => {
											if (user.incomingFriendRequests.length === 1) setShowDropdown(false)
											rejectFriendRequest(requestingUser._id)}
										}>
										Reject
									</ResponseButton>
								</div>
							</Item>
						)}
					</Items>
					{!hasItems &&
						<NoItems>You don&apos;t have any incoming friend requests</NoItems>
					}
				</DropdownContainer>
			}
		</MenuItemContainer>
	)
}

export function Notifications () {
	const [showDropdown, setShowDropdown] = useState(false)
	const { user: loggedInUser, clearNotification } = useAuth()
	const user = loggedInUser!
	const hasItems = user.notifications.length ? user.notifications.length : false

	// Close notifications if user clicks outside the notifications dropdown
	useEffect(() => {
		function callback (e: MouseEvent) {
			const target = e.target as Element
			// First check is to see if MenuItemContainer was clicked
			// Second is to check if it was specifically the button inside it that clears the notification
			// Second check is needed because clearing the notification removes it (along with the event
			// target button inside it) from the DOM, and thus check one returns false
			if (
				document.getElementById('notifications-menu-item-container')!.contains(target) ||
				target.classList.contains('menu-item-response-button')
			) return // and do not close dropdown

			setShowDropdown(false) // Clicked something other than the notification dropdown
		}
		window.addEventListener('click', callback)
		return () => { window.removeEventListener('click', callback) }
	}, [])

	return (
		<MenuItemContainer id='notifications-menu-item-container'>
			<button
				className='icon-button'
				aria-label='unread notifications'
				onClick={() => { setShowDropdown(prev => !prev) }}
			>
				<HeaderIcon src={hasItems ? notificationsPendingIcon : notificationsIcon} alt='' />
				{hasItems && <span>{hasItems}</span>}
			</button>
			{showDropdown &&
				<DropdownContainer>
					<DropdownTitle>Notifications</DropdownTitle>
					<Items> {/* toReversed() returns copy of the array - requires ES2023 */}
						{user.notifications.toReversed().map(notification =>
							<Item key={notification._id || notification._id}>
								<p>
									<Link to={`/user/${notification.user._id}`}>{notification.user.fullname}</Link>
									<span> {notification.message}</span>
									<span className='time'>{getTimeFrame(notification.createdAt)}</span>
								</p>
								<div className= 'buttons'>
									<ResponseButton
										className='menu-item-response-button'
										onClick={() => {
											if (user.notifications.length === 1) setShowDropdown(false)
											clearNotification(notification)
										}}>
										Dismiss
									</ResponseButton>
								</div>
							</Item>
						)}
					</Items>
					{!hasItems && <NoItems>You don&apos;t have any notifications</NoItems>}
				</DropdownContainer>
			}
		</MenuItemContainer>
	)
}

const HeaderIcon = styled.img`
	width: 32px;
	filter: invert(100%);
	&:hover { filter: invert(85%); }
`

const MenuItemContainer = styled.div`
	a span, button span {
		color: #fff;
		font-size: 1rem;
	}
`

const DropdownContainer = styled.div`
	position: absolute;
	top: 70px;
	right: -10px;
	@media (max-width: ${MOBILE}) { right: 10px; }
	border: 5px solid #222;
	border-radius: 5px;
	z-index: 1;
	background: ${headerBlue};
	width: max-content;
	max-width: calc(100vw - 40px);
`

const DropdownTitle = styled.p`
	margin: 15px;
	text-align: center;
	font-size: 1.1rem;
	font-weight: 600;
`

const NoItems = styled.p`
	text-align: center;
	margin: 16px;
`

const Items = styled.div`
	> :not(:first-child)  { border-top: 2px solid #222; }
	> :nth-child(odd) { background: #6b9b9b }
`

const Item = styled.div`
	padding: 20px 15px;
	&:hover { background: teal }
	p {
		margin: 0 0 15px 0;
		color: #fff;
		text-align: start;
		font-size: .9rem;
		a {
			font-size: inherit;
			color: navy;
			&:hover {
				color: navy;
				text-decoration: underline;
			}
		}
	}
	.time {
		display: block;
		margin-top: 8px;
		font-size: .8rem;
		font-weight: 600;
	}
	.buttons {
		display: flex;
		justify-content: space-between;
	}
`

const ResponseButton = styled.button`
	padding: 8px 16px;
	border: 1px solid #222;
	border-radius: 4px;
	font-weight: 600;
	font-size: .8rem;
	&:hover {
		background: green;
		color: #fff;
		&.reject { background: red; }
	}
`
