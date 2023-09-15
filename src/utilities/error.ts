import axios from 'axios'
import { APIErrorResponseData } from '@databaseTypes'

// TODO - Add a second parameter: notifyUser: boolean
// Display global notification at top of page letting user know the request did not succeed
// Component would pass notifyUser: true if it did not handle the error itself or if it was
// something unexpected such as:
// Delete post or comment request not returning a 204
// Server not responding or 500 error
// Client making request to unimplemented API endpoint - 501
// Client sending a bad request not due to the fault of user input - 400
export function handleAxiosCatch (err: unknown): string {
	if (axios.isAxiosError(err) && err.response) {
		const data = err.response.data as APIErrorResponseData
		return data.message
	} else {
		if (!(err instanceof Error)) throw new Error('Error type not passed to handleAxiosCatch')
		return 'Unknown axios error:' + err.message
	}
}
