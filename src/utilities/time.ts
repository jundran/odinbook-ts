export function getTimeFrame (date: string) {
	const postDateUnixTime = new Date(date).valueOf() / 1000
	const diff = Date.now() / 1000 - postDateUnixTime
	if (diff < 60) {
		return 'Just now'
	}	else if (diff < 60 * 60) {
		const minutes =  Math.floor(diff / 60)
		return `${minutes} ${minutes > 1 ? ' minutes' : ' minute'} ago`
	}	else if (diff < 60 * 60 * 24) {
		const hours = Math.floor(diff / 60 / 60)
		return `${hours} ${hours > 1 ? ' hours' : ' hour'} ago`
	}	else {
		const days = Math.floor(diff / 60 / 60 / 24)
		return `${days} ${days > 1 ? ' days' : ' day'} ago`
	}
}

export function formatDate (date: string) {
	return new Date(date).toLocaleDateString(undefined, {
		year: 'numeric', month: 'long', day: 'numeric',
		timeZone: 'UTC'
	})
}

export function formatTime (date: string) {
	const isToday = new Date(date).getDate() === new Date().getDate()
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric', month: 'long', day: 'numeric',
		hour: 'numeric', minute: 'numeric', second: 'numeric'
	}
	return isToday ?
		new Date(date).toLocaleTimeString(undefined) :
		new Date(date).toLocaleDateString(undefined, options)
}

export function getAge (dob: string) {
	const [y, m, d] = dob.split(/-|T/)
	const now = new Date()
	let age = now.getFullYear() - Number(y)
	// If birthday for this year has not yet occurred (month is zero indexed so add 1)
	if ((now.getMonth() + 1 <= Number(m)) && (now.getDate() < Number(d) )) --age
	return age
}
