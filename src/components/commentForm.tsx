import styled from 'styled-components'
import { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import useAuth from '../context/useAuth'
import UserIcon from './userComponents'
import { GridColumns, Line } from '../styles/sharedComponentStyles'
import { Comment } from '@databaseTypes'
import { handleAxiosCatch } from '@utilities/error'

type CommentFormProps = {
	postId: string,
	onPost: (doc: Comment) => void
}
export default function CommentForm ({ postId, onPost}: CommentFormProps) {
	const [text, setText] = useState('')
	const { user, token } = useAuth()

	function handleSubmit (e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		axios.post<{ document: Comment }>(import.meta.env.VITE_API + '/comment', {
			postId,
			text
		}, {
			headers: { 'Authorization': `Bearer ${token}` }
		}).then(res => {
			setText('')
			if (res.status === 201) onPost(res.data.document)
		}).catch(err => handleAxiosCatch(err))
	}

	return (
		<CommentFormContainer>
			<GridColumns>
				<UserIcon profilePicture={user!.profilePicture} />
				<Form onSubmit={handleSubmit}>
					<TextBox text={text} onChange={updatedText => { setText(updatedText) }} />
					<button>Send</button>
				</Form>
			</GridColumns>
			<Line />
		</CommentFormContainer>
	)
}

const CommentFormContainer = styled.div`
	margin: 0 0 16px 0;
`

const Form = styled.form`
	display: flex;
	gap: 4px;
	button {
		padding: 0 14px;
		border: 1px solid #b1b1b1;
		border-radius: 5px;
		height: 32px;
		align-self: flex-end;
	}
`

type TextBoxType = {
	text: string,
	onChange: (updatedText: string) => void
}
function TextBox ({ text, onChange }: TextBoxType) {
	const [expanded, setExpanded] = useState(false)

	useEffect(() => {
		if (text) setExpanded(true)
		else setExpanded(false)
	}, [text])

	return (
		<TextArea
			value={text}
			onChange={e => { onChange(e.target.value) }}
			placeholder="Write a comment..."
			$expanded={expanded}
		/>
	)
}

const TextArea = styled.textarea<{ $expanded: boolean }>`
	height: 30px;
	width: 100%;
	padding: 4px;
	resize: none;
	font-family: inherit;
	font-size: inherit;
	height: ${props => props.$expanded ? '75px' : '30px'}
`
