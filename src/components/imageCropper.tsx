import styled from 'styled-components'
import { useState, useRef, ChangeEvent } from 'react'
import ReactCrop, { Crop as CropType } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import axios from 'axios'
import useAuth from '../context/useAuth'
import { blobToDataURL, dataUrlToBlob } from '../utilities/file'
import { MOBILE, MOBILE_SMALL } from '../styles/sharedComponentStyles'
import { LoggedInUser } from '@databaseTypes'
import { handleAxiosCatch } from '@utilities/error'

// Testing images
// import portrait from '../assets/olga.jpg'
// import small from '../assets/olga-300.png'
// import panoramic from '../assets/thomas.jpg'
// import oversize from '../assets/tobias.jpg'
const testImage = ''

export default function ImageCropper ({ close }: { close: () => void }) {
	const [photo, setPhoto] = useState(testImage)
	const [croppedPhoto, setCroppedPhoto] = useState('')
	const [cropAdjusted, setCropAdjusted] = useState(false)
	const [mode, setMode] = useState<'preview' | 'crop' | 'upload'>(photo ? 'crop' : 'upload')
	const [fileError, setFileError] = useState('')
	const [crop, setCrop] = useState<CropType>({
		unit: '%',
		x: 25,
		y: 25,
		width: 50,
		height: 50
	})

	const filename = useRef('')
	const { token, setUser } = useAuth()

	function handleCrop () {
		// This is the original image that will be cropped
		const originalImage = new Image()
		originalImage.crossOrigin = 'annoymous'
		originalImage.src = photo

		// This is the rendered image that is used with the crop tool
		const domImage = document.getElementById('domImage')! as HTMLImageElement

		// Size factor of original image compared to what is rendered
		// Factors X and Y should be the same but get both for debugging
		const factorX = originalImage.width / domImage.width
		const factorY = originalImage.height / domImage.height

		// Scale original image according to crop made on rendered image
		// Rendered image dimension are affected by CSS
		const actualX = Math.round(crop.x * factorX)
		const actualY = Math.round(crop.y * factorY)
		const actualWidth = Math.round(crop.width  * factorX)
		const actualHeight = Math.round(crop.height  * factorY)

		// Setup the canvas and draw a new image from a crop of the original
		const canvas = document.createElement('canvas')
		canvas.width = actualWidth
		canvas.height = actualHeight
		const ctx = canvas.getContext('2d')
		if (!ctx) throw new Error('Canvas does not have 2d context')

		ctx.drawImage(
			originalImage,
			actualX, actualY,
			actualWidth, actualHeight,
			0, 0,
			actualWidth, actualHeight
		)

		// Debugging info
		console.log('Factor', factorX, factorY)
		console.log('Rendered', domImage.width, domImage.height)
		console.log('Original', originalImage.width, originalImage.height)
		console.log('Crop', crop.x, crop.y, crop.width, crop.height)
		console.log('Actual', actualX, actualY, actualWidth, actualHeight)

		// Preview the cropped image with option to save
		setCroppedPhoto(canvas.toDataURL())
		setMode('preview')
	}

	function handleUpload (e: ChangeEvent<HTMLInputElement>) {
		if (!e.target.files) throw new Error('No files found')
		const file = e.target.files[0]
		// Browser determines type by extension so text file ending .jpg will register as an image
		// Further checks are done server side
		if (!file.type.match('image')) {
			setFileError('File must be an image'); return
		}

		filename.current = file.name
		// setPhoto(await blobToDataURL(file))
		blobToDataURL(file).then(res => { setPhoto(res) })
			.catch(err => { throw err })
			.finally(() => {
				setFileError('')
				setMode('crop')
			})
	}

	async function handleSave () {
		const formData = new FormData()
		formData.append('file', await dataUrlToBlob(croppedPhoto), filename.current)

		axios.post<{ document: LoggedInUser }>(import.meta.env.VITE_API + '/user/portrait',
			formData,
			{ headers: { 'Authorization': `Bearer ${token}` }}
		).then(res => {
			if (res.status === 200 || res.status === 201) {
				setUser(res.data.document)
				close()
			}
		}).catch(err => handleAxiosCatch(err))
	}

	return (
		<Container className='Container'>
			<ImageHolder className='ImageHolder'>
				{mode === 'crop' &&
					<ReactCrop
						crop={crop}
						onChange={c => {
							setCrop(c)
							if (c.width > 48 || c.height > 48) setCropAdjusted(true)
							else setCropAdjusted(false)
						}}
						aspect={1}
					>
						<img className='imageToCrop' id='domImage' crossOrigin='anonymous' src={photo} alt='portrait' />
					</ReactCrop>
				}{mode === 'preview' &&
					<img className='preview' src={croppedPhoto} alt='cropped' />
				}{mode === 'upload' &&
					<Uploader className='Uploader'>
						<p>Select a photo from your device</p>
						<input onChange={handleUpload} aria-label='Upload photo' type='file' accept='image/*' />
						{fileError && <p>{fileError}</p> }
					</Uploader>
				}
			</ImageHolder>
			<Controls className='Controls'>
				{/* Upload button */}
				{mode !== 'upload' && <button onClick={() => { setMode('upload') }}>Change Photo</button>}
				{mode === 'upload' && photo &&
					<button onClick={() => { setFileError(''); setMode('crop') }}>Cancel Upload</button>
				}
				{/* Crop Again button */}
				{mode === 'preview' &&
					<button onClick={() => { setMode('crop') }}>Adjust Crop</button>
				}
				{/* Preview or Save button */}
				{mode !== 'upload' &&
					<button onClick={mode === 'preview' ? handleSave : handleCrop} disabled={!cropAdjusted}>
						{mode === 'preview' ? 'Save' : 'Preview'}
					</button>
				}
				{/* Close button */}
				<button onClick={close}>Close</button>
			</Controls>
		</Container>
	)
}

const Container = styled.div`
	border: 5px solid #222;
	margin: 8px;
`

const ImageHolder = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: calc(80vh - 100px);
	.imageToCrop, .preview {
		max-width: 100%;
		max-height: calc(80vh - 100px)
	}
`

const Uploader = styled.div`
	padding: 20px;
	p {
		font-size: 1.2rem;
		font-weight: 600;
	}
`

const Controls = styled.div`
	height: 100px;
	border-top: 5px solid #222;
	padding: 15px;
	display: flex;
	justify-content: center;
	gap: 10px;
	overflow: scroll;
	button {
		padding: 0 20px;
		&:disabled {
			cursor: not-allowed;
			opacity: .5;
		}
		@media (max-width: ${MOBILE}) {
			padding: 5px;
		}
		@media (max-width: ${MOBILE_SMALL}) {
			font-size: .8rem;
		}
	}
`
