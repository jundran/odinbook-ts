import styled from 'styled-components'
import { FormEvent, useState } from 'react'
import axios from 'axios'
import useAuth from '../context/useAuth'
import { checkNameValidity, getFormBody } from '@utilities/form'
import { handleAxiosCatch } from '@utilities/error'
import { headerBlue, Status } from '../styles/sharedComponentStyles'
import { LoggedInUser } from '@databaseTypes'

export function LoginForm () {
	const [error, setError] = useState('')
	const { login: loginContext, token } = useAuth()

	function login (e: FormEvent<HTMLFormElement>) {
		e.preventDefault()

		axios.post<{ document: LoggedInUser, token: string }>(import.meta.env.VITE_API + '/auth/login',
			getFormBody(e.currentTarget),
			{ headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			}}
		).then(res => {
			if (res.status === 200) {
				loginContext(res.data.document, res.data.token)
			} else {
				console.log('Unable to login. Server returned code:', res.status)
			}
		}).catch(err => { setError(handleAxiosCatch(err)) })
	}

	return (
		<Form aria-label='log in' onSubmit={login}>
			<h2>Log in</h2>
			<ul>
				<li>
					<label htmlFor="email">Email</label>
					<input name="email" type="email" autoComplete='username' required />
				</li>
				<li>
					<label htmlFor="password">Password</label>
					<input name="password" type="password" autoComplete='current-password' required />
				</li>
			</ul>
			{error && <ErrorsContainer><p>{error}</p></ErrorsContainer>}
			<button>Log in</button>
		</Form>
	)
}

export function SignupForm () {
	const [password, setPassword] = useState('')
	const [passwordConfirm, setPasswordConfirm] = useState('')
	const [error, setError] = useState('')
	const { login } = useAuth()
	const passwordsMatch = password === passwordConfirm

	function handleSubmit (e: FormEvent<HTMLFormElement>) {
		e.preventDefault()
		if (!passwordsMatch) return // redundant check

		axios.post<{ document: LoggedInUser, token: string }>(import.meta.env.VITE_API + '/user',
			getFormBody(e.currentTarget),
			{ headers: { 'Accept': 'application/json' }}
		).then(res => {
			if (res.status === 201) login(res.data.document, res.data.token)
		}).catch(err => { setError(handleAxiosCatch(err)) })
	}

	return (
		<Form aria-label='sign-up' onSubmit={handleSubmit}>
			<h2>Create a new account</h2>
			<ul>
				<li>
					<label htmlFor="firstname">Firstname</label>
					<input name="firstname" required minLength={2} onChange={e => { checkNameValidity(e.target) }} />
				</li>
				<li>
					<label htmlFor="surname">Surname</label>
					<input name="surname" required minLength={2} onChange={e => { checkNameValidity(e.target) }} />
				</li>
				<li>
					<label htmlFor="email">Email</label>
					<input name="email" type="email" autoComplete='username' required />
				</li>
				<li>
					<label htmlFor="dob">Date of Birth</label>
					<input name="dob" type="date" required max={new Date().toISOString().split('T')[0]} />
				</li>
				<li>
					<label htmlFor="password">Password</label>
					<input name="password" type="password" value={password}
						onChange={e => { setPassword(e.target.value) }}
						autoComplete='new-password' required minLength={8}
					/>
				</li>
				<li>
					<label htmlFor="passwordConfirm">Password Confirm</label>
					<input name="passwordConfirm" type="password" value={passwordConfirm}
						onChange={e => { setPasswordConfirm(e.target.value) }}
						autoComplete='new-password' required minLength={8}
					/>
					{password !== '' && passwordConfirm !== '' &&
						<Status $modified={!passwordsMatch}>
							{passwordsMatch ? 'Passwords match' : 'Passwords do not match' }
						</Status>
					}
				</li>
			</ul>
			{error && <ErrorsContainer><p>{error}</p></ErrorsContainer>}
			<button disabled={!passwordsMatch}>Sign up</button>
		</Form>
	)
}

export const ErrorsContainer = styled.div`
	width: fit-content;
	border: 1px dotted red;
	color: red;
	p { margin: 10px; }
`

export const Form = styled.form`
	h2 {
		text-align: center;
		color: ${headerBlue};
	}
	ul {
		padding: 0;
		margin: 0;
	}
	li {
		list-style: none;
		margin-bottom: 15px;
		> * { display: block; }
	}
	label {
		margin-bottom: 10px;
	}
	input {
		padding: 10px;
		width: 100%;
		&[name='passwordConfirm'] {
			margin-bottom: 8px;
		}
	}
	button {
		margin-top: 5px;
		background: #6cabc0;
		color: #fff;
		width: 100%;
		padding: 10px;
		font-weight: 600;
		border: 1px solid teal;
	}
`
