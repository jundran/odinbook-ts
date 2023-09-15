import styled from 'styled-components'
import { useState, Fragment } from 'react'
import axios from 'axios'
import useAuth from '../context/useAuth'
import Like from './like'
import Others from './others'
import { SimpleLink } from '../styles/sharedComponentStyles'
import { UserMinimal } from '@databaseTypes'
import { handleAxiosCatch } from '@utilities/error'

type PostLikesProps = {
	data: UserMinimal[]
	postId: string
}
export default function PostLikes ({ data, postId }: PostLikesProps) {
	const [likes, setLikes] = useState(data)
	const { user: loggedInUser, token } = useAuth()
	const user = loggedInUser!

	const userLikesPost = likes.find(like => like._id === user._id)
	// Ensure current user is first in the array
	if (userLikesPost && likes[0]._id !== user._id) {
		const copy = likes.filter(like => like._id !== user._id)
		copy.unshift(userLikesPost)
		setLikes(copy)
	}

	function handleLike () {
		axios.patch<{ document: UserMinimal[] }>(
			import.meta.env.VITE_API + `/post/${userLikesPost ? 'unlike' : 'like'}`,
			{ 'id': postId },
			{	headers: { 'Authorization': `Bearer ${token}` }}
		).then(res => { setLikes(res.data.document) }
		).catch(err => handleAxiosCatch(err))
	}

	return (
		<Container>
			<Like likes={likes} dataType='post' onLikeOrUnlike={handleLike}/>
			<p>
				{likes.slice(0, 3).map((likingUser, index) =>
					<Fragment key={likingUser._id}>
						<SimpleLink key={likingUser._id} to={`/user/${likingUser._id}`}>
							{likingUser._id === user._id ? 'You' : likingUser.fullname}
						</SimpleLink>
						{index < 2 && index < likes.length - 1 && <span>, </span>}
					</Fragment>
				)}
				{likes.length > 0 &&
					<>
						<span>{` and ${Math.max(0, likes.length - 3)} `}</span>
						<Others likes={likes}/>
						<span> like this post</span>
					</>
				}
			</p>
		</Container>
	)
}

const Container = styled.div`
	font-size: .8rem;
`
