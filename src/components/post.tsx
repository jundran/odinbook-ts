import styled from 'styled-components'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import axios from 'axios'
import useAuth from '../context/useAuth'
import UserIcon from './userComponents'
import PostHeader from './postHeader'
import PostBody from './postBody'
import PostLikes from './postLikes'
import PostComments from './postComments'
import ConfirmBox from './confirmBox'
import { handleAxiosCatch } from '@utilities/error'
import { Post as PostType } from '@databaseTypes'

type PostProps = {
	postData: PostType
	refreshPosts: () => void
}
export default function Post ({ postData, refreshPosts }: PostProps) {
	const [showConfirm, setShowConfirm] = useState(false)
	const { user, token } = useAuth()

	function deletePost (confirmation: boolean) {
		setShowConfirm(false)
		if (!confirmation) return

		axios.delete(import.meta.env.VITE_API + '/post/' + postData._id, {
			headers: { 'Authorization': `Bearer ${token}` }
		}).then(res => { if (res.status === 204) refreshPosts()
		}).catch(err => handleAxiosCatch(err))
	}

	return (
		<PostContainer className='post white-bg'>
			<UserIcon profilePicture={postData.user.profilePicture} size='40px'/>
			<Container>
				<PostHeader data={postData} />
				<PostBody text={postData.text} image={postData.image} />
				<PostLikes data={postData.likes} postId={postData._id} />
				<PostComments data={postData.comments} postId={postData._id} />
				{user!._id === postData.user._id &&
					<DeleteButton onClick={() => { setShowConfirm(true) }}>Delete Post</DeleteButton>
				}
			</Container>
			{showConfirm && createPortal(
				<ConfirmBox message='Delete Post? Are you sure?' onResponse={deletePost} />,
				document.getElementById('modal')!
			)}
		</PostContainer>
	)
}

const PostContainer = styled.div`
	display: grid;
	grid-template-columns: auto 1fr;
`

const Container = styled.div`
	margin-left: 12px;
	font-size: 90%;
	color: #222;
`

const DeleteButton = styled.button`
	border: 1px solid lightgrey;
	background: none;
	padding: 4px;
	font-weight: 600;
	font-size: 90%;
	color: orange;
	&:hover { color: red }
`
