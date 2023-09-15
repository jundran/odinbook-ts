import { useState, FormEvent, ChangeEvent } from 'react'
import axios from 'axios'
import useAuth from '../context/useAuth'
import { Form } from './aboutForm'
import { handleAxiosCatch } from '@utilities/error'
import { getFormBody } from '@utilities/form'
import { Status } from '../styles/sharedComponentStyles'

export default function PasswordForm () {
	const [passwordFieldChanged, setPasswordFieldChanged] = useState(false)
	const [passwordsMatch, setPasswordsMatch] = useState(false)
	const [error, setError] = useState('')
	const { user, token } = useAuth()

	function handleSubmit (e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError('')
		if (!passwordsMatch) return // redundant check

		axios.put(import.meta.env.VITE_API + '/auth/updatepassword',
			getFormBody(e.currentTarget),
			{ headers: { 'Authorization': `Bearer ${token}` }}
		).then(res => {	if (res.status === 204) resetForm(e.currentTarget) }
		).catch(err => { setError(handleAxiosCatch(err)) })
	}

	function resetForm (form?: HTMLFormElement) {
		form?.reset()
		setPasswordFieldChanged(false)
		setPasswordsMatch(false)
		setError('')
	}

	function checkForChange (e: ChangeEvent<HTMLInputElement>) {
		const form = e.target.form
		if (!form) throw new Error('Input should belong to a form')

		if (Array.from(new FormData(form).entries()).some(formInput => formInput[1] !== '')  ) {
			setPasswordFieldChanged(true)
		} else {
			setPasswordFieldChanged(false)
		}
		checkForMatch(form)
	}

	function checkForMatch (form: HTMLFormElement) {
		const body = getFormBody(form)
		body.password.valueOf() === body.passwordConfirm.valueOf() ?
			setPasswordsMatch(true) :	setPasswordsMatch(false)
	}

	return (
		<section>
			<h2>Change Password</h2>
			<Form aria-label='change password' onSubmit={handleSubmit} onReset={() => { resetForm() }}>
				{/* For accessibility - password manager */}
				<input style={{ display: 'none' }} type='email'
					defaultValue={user!.email} autoComplete='username'
				/>
				<ul>
					<li>
						<label htmlFor="password">New Password</label>
						<input type='password' name="password" id="password"
							onChange={checkForChange} autoComplete='new-password' required minLength={8}
						/>
						<Status $modified={passwordFieldChanged}>
							{passwordFieldChanged ? 'Modified' : 'Saved' }
						</Status>
					</li>
					<li>
						<label htmlFor="passwordConfirm">Confirm Password</label>
						<input type='password' name="passwordConfirm" id="passwordConfirm"
							onChange={checkForChange} autoComplete='new-password' required minLength={8}
						/>
						{passwordFieldChanged &&
							<Status $modified={!passwordsMatch}>
								{passwordsMatch ? 'Passwords match' : 'Passwords do not match' }
							</Status>
						}
					</li>
					<li>
						<label htmlFor="currentPassword">Existing Password</label>
						<input type='password' name="currentPassword" id="currentPassword"
							onChange={checkForChange} autoComplete='existing-password' required minLength={8}
						/>
					</li>
					{error && <p style={{ color: 'red' }}>{error}</p>}
					{passwordFieldChanged &&
						<div>
							<button
								style={{ color: 'orange' }}
								type='reset'
							>
								Clear
							</button>
							<button disabled={!passwordsMatch}>Update Password</button>
						</div>
					}
				</ul>
			</Form>
		</section>
	)
}
