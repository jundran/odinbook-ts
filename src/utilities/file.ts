export async function blobToDataURL (blob: File) {
	const reader = new FileReader()
	return new Promise<string>((resolve, reject)=> {
		reader.readAsDataURL(blob)
		reader.onload = () => {
			const result = reader.result
			if (typeof result === 'string') resolve(result)
			else reject('Image not converted to string')
		}
	})
}

export async function dataUrlToBlob (dataUrl: string) {
	const res = await fetch(dataUrl)
	return res.blob()
}
