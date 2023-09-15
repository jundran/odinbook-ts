export function checkNameValidity (eventTarget: HTMLInputElement) {
	if (eventTarget.value.trim().length < 2) {
		eventTarget.setCustomValidity('Name must be at least 2 letters')
		eventTarget.reportValidity()
	} else {
		eventTarget.setCustomValidity('')
		eventTarget.reportValidity()
	}
}

// TypeScript compliant helper function to get form fields
export function getFormBody (form: HTMLFormElement): Record<string, FormDataEntryValue>  {
	const body: Record<string, FormDataEntryValue> = {}
	for (const field of new FormData(form).entries()) {
		body[field[0]] = field[1]
	}
	return body
}
