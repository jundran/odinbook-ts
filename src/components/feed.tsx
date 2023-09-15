import styled from 'styled-components'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import useAuth from '../context/useAuth'
import PostComponent from './post'
import PostCreate from '../components/postCreate'
import { handleAxiosCatch } from '@utilities/error'
import { Post, User } from '@databaseTypes'

export default function Feed () {
	const { token } = useAuth()
	const [posts, setPosts] = useState<Post[]>([])

	const fetchPosts = useCallback(() =>  {
		axios.get<{ documents: Post[] }>(import.meta.env.VITE_API + '/post/feed', {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			}
		}).then(res => { setPosts(res.data.documents) }
		).catch(err => handleAxiosCatch(err))
	}, [token])

	useEffect(() => { fetchPosts() }, [fetchPosts])

	return (
		<section>
			<PostCreate refreshPosts={fetchPosts} />
			<h2>Odin Feed</h2>
			<Posts>
				{posts.length ? posts.map(post => (
					<PostComponent
						key={post._id}
						postData={post}
						refreshPosts={fetchPosts}
					/>
				)) :
					<p>This is your feed. When you or your friends make posts they will show up here.</p>
				}
			</Posts>
		</section>
	)
}

export function UserPosts ({ user }: { user: User }) {
	const [posts, setPosts] = useState<Post[]>([])
	const { user: currentUser, token } = useAuth()
	const loggedInUser = currentUser!

	const fetchPosts = useCallback(() =>  {
		axios.get<{ documents: Post[] }>(import.meta.env.VITE_API + '/post/user/' + user._id, {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			}
		}).then(res => { setPosts(res.data.documents) }
		).catch(err => handleAxiosCatch(err))
	}, [token, user._id])

	useEffect(() => { fetchPosts() }, [fetchPosts])


	const userIsCurrentUser = loggedInUser._id === user._id
	const userIsFriend = loggedInUser.friends.some(friend => friend._id === user._id)
	return (
		<section>
			{userIsCurrentUser && <PostCreate refreshPosts={fetchPosts} bannerHeader />}
			<h2 className='white-bg' style={userIsCurrentUser ? {} : { marginTop: 0 }}>
				{userIsCurrentUser ? 'My Posts' : `Posts by ${user.firstname}`}
			</h2>
			{userIsCurrentUser || userIsFriend ?
				<Posts >
					{posts.length ? posts.map(post => (
						<PostComponent
							key={post._id}
							postData={post}
							refreshPosts={fetchPosts}
						/>
					)) : (
						<>
							{loggedInUser._id === user._id ?
								<p>This is your feed. When you or your friends make posts they will show up here.</p>
								:
								<p><span>{user.fullname}</span> has not made any posts</p>
							}
						</>
					)}
				</Posts>
				:
				<p>You must add <span>{user.firstname}</span> as a friend to see their posts</p>
			}
		</section>
	)
}

const Posts = styled.div`
	> div {
		margin-bottom: 40px;
	}
`
