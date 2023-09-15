import styled from 'styled-components'
import { ChatFriend } from './userComponents'
import useAuth from '../context/useAuth'
import { UserMinimal } from '@databaseTypes'

type Props = {
	activeFriend: UserMinimal | null,
	setActiveFriend: (friend: UserMinimal) => void
}
export default function FriendsStatus ({ activeFriend, setActiveFriend }: Props) {
	const { user } = useAuth()

	return (
		<Container className='FriendsStatus'>
			{user!.friends.map((friend: UserMinimal) =>
				<ChatFriend
					key={friend._id}
					userData={friend}
					isActive={activeFriend?._id === friend._id}
					onClick={() => { setActiveFriend(friend) }}
				/>
			)}
		</Container>
	)
}

const Container = styled.section`
	flex-shrink: 0;
	overflow: auto;
`
