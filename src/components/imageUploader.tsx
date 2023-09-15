import { useRef, useState, FormEvent, useEffect } from 'react'
import styled from 'styled-components'
import { blobToDataURL } from '../utilities/file'

type ImageUploaderProps = {
	image: string
	setImageAndFileName: (image: string, fileName: string) => void
}
export default function ImageUploader ({ image, setImageAndFileName }: ImageUploaderProps) {
	const [fileError, setFileError] = useState('')
	const formRef = useRef<HTMLFormElement>(null)
	const removeImage = () => { setImageAndFileName('', '') }

	useEffect(() => {
		// Remove filename from input after submitting post
		if (!image) formRef.current!.reset()
	}, [image])

	function handleUpload (e: FormEvent<HTMLFormElement> & { target: HTMLInputElement}) {
		if (!e.target.files?.length) throw new Error('File list is empty')
		const file = e.target.files[0]
		if (file.type.match('image')) {
			blobToDataURL(file)
				.then(dataURL => {
					setFileError('')
					setImageAndFileName(dataURL, file.name)
				}).catch(err => { console.error(err) })
		} else {
			setFileError(`The file "${file.name}" is not an image and cannot be posted.`)
			removeImage()
		}
	}

	function handleRemove () {
		removeImage()
		formRef.current!.reset()
	}

	function handleClearError () {
		formRef.current!.reset()
		setFileError('')
	}

	return (
		<ImageUploaderContainer>
			<form ref={formRef} onChange={handleUpload}>
				<label htmlFor="upload">Add image</label>
				<input name='upload' id='upload' type="file" accept='image/*'/>
				<FileError $hasError={fileError !== ''}>
					<p>{fileError}</p>
					<button type='button' onClick={handleClearError}>clear</button>
				</FileError>
			</form>
			{image &&
				<>
					<img src={image} alt='uploaded' />
					<button onClick={handleRemove}>Remove image</button>
				</>
			}
		</ImageUploaderContainer>
	)
}

const ImageUploaderContainer = styled.div`
	padding: 20px 0;
	img {
		display: block;
		max-height: 300px;
		max-width: 100%;
	}
	label {
		display: block;
		font-weight: 600;
		margin-bottom: 10px;
	}
	input {
		// Handle long file names on mobile
		max-width: calc(90vw - 40px);
	}
	button {
		margin-top: 4px;
		border: none;
		background: none;
		color: navy;
		padding-left: 0;
		&:hover { text-decoration: underline;	}
	}
`

const FileError = styled.div<{ $hasError: boolean }>`
	min-height: 41px; // Avoid pushing down rest of page on error
	display: flex;
	visibility: ${props => props.$hasError ? 'auto' : 'hidden'};
	align-items: center;
	p, button {
		font-size: .8rem;
	}
	p {
		color: red;
		word-break: break-word;
	}
	button {
		margin: 0 10px;
	}
`
