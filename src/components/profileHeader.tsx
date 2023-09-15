import styled from 'styled-components'
import { useNavigate, useParams } from 'react-router-dom'
import useAuth from '../context/useAuth'
import { headerBlue, MOBILE } from '../styles/sharedComponentStyles'
import { User } from '../types/database'

export default function ProfileHeader ({ user }: { user: User }) {
	const navigate = useNavigate()
	const params = useParams()
	const {
		user: loggedInUser,
		sendFriendRequest,
		removeFriend,
		cancelFriendRequest,
		acceptFriendRequest
	} = useAuth()
	const currentUser = loggedInUser!
	const userPageBelongsToLoggedInUser = !params.id || currentUser._id === params.id

	const friendStatus = (() => {
		if (currentUser.friends.some(friend => friend._id === user._id)) return 'friend'
		else if (currentUser.incomingFriendRequests.some(friend => friend._id === user._id)) return 'awaiting-aproval'
		else if (currentUser.outgoingFriendRequests.some(friend => friend._id === user._id)) return 'pending'
		else return 'stranger'
	})()

	function handleFriend () {
		if (friendStatus === 'friend') {
			removeFriend(user._id)
		} else if (friendStatus === 'stranger') {
			sendFriendRequest(user._id)
		} else if (friendStatus === 'pending') {
			cancelFriendRequest(user._id)
		} else { // friendStatus === 'awaiting-aproval'
			acceptFriendRequest(user._id)
		}
	}

	function friendButtonText () {
		if (friendStatus === 'friend') return 'Unfriend'
		else if (friendStatus === 'pending') return 'Cancel friend request'
		else if (friendStatus === 'awaiting-aproval') return 'Accept friend request'
		else return 'Send friend request'
	}

	return (
		<Profile>
			<img src={import.meta.env.VITE_SERVER + user.profilePicture} alt="user" />
			<Info>
				<Name>{user.fullname}</Name>
				<FriendsCount>{`${user.friends.length} friends`}</FriendsCount>
				{userPageBelongsToLoggedInUser ?
					<Button onClick={() => { navigate('/profile/edit') }}>Edit Profile</Button> :
					<Button onClick={handleFriend}>{friendButtonText()}</Button>
				}
			</Info>
		</Profile>
	)
}

const Profile = styled.section`
	display: flex;
	gap: 20px;
	padding: 0 0 32px 0;
	border-bottom: 2px solid ${headerBlue};
	margin-bottom: 32px;
	img {
		border-radius: 50%;
		width: 180px;
		height: fit-content;
		@media (max-width: ${MOBILE}) {
			width: 120px;
		}
	}
`

const Info = styled.div`
	align-self: end;
`

const Name = styled.p`
	font-size: 1.5rem;
	font-weight: 600;
	margin: 0;
`

const FriendsCount = styled.p`
	margin: 8px 0 0 0;
	color: #616161;
`

const Button = styled.button`
	margin: 20px 0 20px 0;
	border: none;
	background: none;
	font-size: 1.2rem;
	color: #616161;;
	border: 1px solid ${headerBlue};
	border-radius: 2px;
	padding: 10px;
	&:hover {
		color: #eee;
		background: ${headerBlue};
	}
`
