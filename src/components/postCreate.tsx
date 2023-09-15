import styled from 'styled-components'
import { useState, useRef, FormEvent } from 'react'
import axios from 'axios'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import useAuth from '../context/useAuth'
import { dataUrlToBlob } from '../utilities/file'
import UserIcon from './userComponents'
import ImageUploader from './imageUploader'
import { GridColumns, Line } from '../styles/sharedComponentStyles'
import { handleAxiosCatch } from '@utilities/error'

type PostCreateProps = {
	refreshPosts: () => void
	bannerHeader?: boolean
}
export default function PostCreate ({ refreshPosts, bannerHeader } : PostCreateProps) {
	const [text, setText] = useState('')
	const { user, token } = useAuth()
	const [image, setImage] = useState<string>('')
	const fileName = useRef<string>('')

	function handleSubmit (e: FormEvent<HTMLFormElement>) {
		e.preventDefault()

		const formData = new FormData()
		formData.append('user', user!._id)
		formData.append('text', text)
		if (image) {
			dataUrlToBlob(image)
				.then(image => { formData.append('file', image, fileName.current) })
				.catch(() => { throw new Error('Failed to convert imageUrl to blob') })
		}

		axios.post(import.meta.env.VITE_API + '/post', formData, {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			}
		}).then(res => {
			if (res.status === 201) {
				setText('')
				setImageAndFileName('', '')
				refreshPosts()
			}
		}).catch(err => handleAxiosCatch(err))
	}

	function handleEdit (value: string) {
		// Quill editor returns this junk HTML when user types something but then deletes it
		if (value !== '<p><br></p>') setText(value)
		else setText('')
	}

	function setImageAndFileName (image: string, imageFileName: string) {
		setImage(image)
		fileName.current = imageFileName
	}

	return (
		<PostCreateContainer $bannerHeader={bannerHeader ?? false}>
			<h2>Create a new post</h2>
			<GridColumns>
				<UserIcon profilePicture={user!.profilePicture} size='40px' />
				<div>
					<form onSubmit={handleSubmit}>
						<div onDrop={e => { e.preventDefault() }}> {/* Prevent dragging images into editor */}
							<ReactQuill theme="snow" value={text} onChange={handleEdit} />
						</div>
						<button className='submit' disabled={!text && !image}>Post</button>
					</form>
					<ImageUploader image={image} setImageAndFileName={setImageAndFileName}/>
				</div>
			</GridColumns>
			<Line />
		</PostCreateContainer>
	)
}

const PostCreateContainer = styled.div<{ $bannerHeader: boolean }>`
	button.submit {
		border: 2px solid navy;
		border-radius: 2px;
		padding: 8px 24px;
		margin-top: 10px;
		font-weight: 600;
		font-size: 90%;
	}
	${props => props.$bannerHeader && `
			h2 {
				background: #fff;
				padding: 20px;
				border-radius: 4px;
				margin-top: 0;
			}
	`}
`
