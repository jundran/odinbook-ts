import useAuth from '../context/useAuth'
import { Badge } from '../components/userComponents'
import styled from 'styled-components'
import { headerBlue } from '../styles/sharedComponentStyles'
import { UserMinimal } from '@databaseTypes'

export default function FriendsPage () {
	document.title = 'Friend\'s Page'
	const { user: loggedInUser } = useAuth()
	const user = loggedInUser!

	return (
		<main>
			<h2>Incoming Friend Requests</h2>
			<FriendsContainer>
				{ user.incomingFriendRequests.map(friend =>
					<IncomingFriendRequest key={friend._id} friend={friend} />
				)}
				{!user.incomingFriendRequests.length &&
					<p>You don&apos;t have any incoming friend requests</p>
				}
			</FriendsContainer>
			<h2>Pending Requests</h2>
			<FriendsContainer>
				{ user.outgoingFriendRequests.map(friend =>
					<OutgoingFriendRequest key={friend._id} friend={friend} />
				)}
				{!user.outgoingFriendRequests.length &&
					<p>You don&apos;t have any pending friend requests</p>
				}
			</FriendsContainer>
			<h2>Friends</h2>
			<FriendsContainer>
				{ user.friends.map(friend =>
					<Friend key={friend._id} data={friend} />
				)}
				{!user.friends.length &&
					<p>You don&apos;t have any friends</p>
				}
			</FriendsContainer>
		</main>
	)
}

function Friend ({ data }: { data: UserMinimal }) {
	const { removeFriend } = useAuth()

	return (
		<FriendCard>
			<Badge userData={data} />
			<button onClick={() => { removeFriend(data._id) }}>Unfriend</button>
		</FriendCard>
	)
}

function IncomingFriendRequest ({ friend }: { friend: UserMinimal }) {
	const { acceptFriendRequest, rejectFriendRequest } = useAuth()
	return (
		<FriendCard>
			<Badge userData={friend} />
			<SpaceBetween>
				<button onClick={() => { acceptFriendRequest(friend._id) }}>Accept Request</button>
				<button onClick={() => { rejectFriendRequest(friend._id) }}>Reject Request</button>
			</SpaceBetween>
		</FriendCard>
	)
}

function OutgoingFriendRequest ({ friend }: { friend: UserMinimal }) {
	const { cancelFriendRequest } = useAuth()

	return (
		<FriendCard>
			<Badge userData={friend} />
			<button onClick={() => { cancelFriendRequest(friend._id) }}>Cancel request</button>
		</FriendCard>
	)
}

const FriendsContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 32px;
	margin-bottom: 40px;
	button {
		padding: 10px;
		font-size: 90%;
		border: 1px solid #222;
		border-radius: 2px;
		background: ${headerBlue};
	}
`

const SpaceBetween = styled.div`
	display: flex;
	justify-content: space-between;
`

const FriendCard = styled.div`
	width: 300px;
	border: 2px solid #222;
	border-radius: 8px;
	padding: 20px;
	background: #fff;
`
