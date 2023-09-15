import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import useAuth from '../context/useAuth'
import { formatDate, getAge } from '../utilities/time'
import ProfileHeader from '../components/profileHeader'
import { UserPosts } from '../components/feed'
import email from '../assets/email.svg'
import birthday from '../assets/birthday.svg'
import job from '../assets/job.svg'
import home from '../assets/home.svg'
import school from '../assets/school.svg'
import hobbies from '../assets/hobbies.svg'
import animal from '../assets/animal.svg'
import clock from '../assets/clock.svg'
import { handleAxiosCatch } from '@utilities/error'
import { DESKTOP } from '../styles/sharedComponentStyles'
import { User, UserMinimal } from '../types/database'

export default function UserPage () {
	const { id: paramsId } = useParams()
	const { user, token } = useAuth()
	const currentUser = user!
	const id = paramsId ?? currentUser._id
	const [data, setData] = useState<User | null>(null) // Data of the user in params
	const [error, setError] = useState(false)

	useEffect(() => {
		// Watching currentUser.friends.length because user friend status may have changed
		// Server only returns mutual friends if currentUser is not friend of user
		if (!token) return
		axios.get<{ document: User }>(import.meta.env.VITE_API + `/user/${id}`, {
			headers: {
				'Authorization': `Bearer ${token}`,
				'Accept': 'application/json'
			}
		}).then(res => {
			setData(res.data.document)
			document.title = 'User Page: ' + res.data.document.fullname
		}).catch(err => {
			setError(true)
			handleAxiosCatch(err)
		})
	}, [currentUser.friends.length, id, token])

	useEffect(() => {
		// Start at the top of the page and clear data when rerendering with id of another user
		window.scrollTo(0, 0)
		setData(null)
		setError(false)
	}, [id])

	if (!data) return <main><h1>Loading</h1></main>
	if (error) return <main><h1>User Page not found - 404</h1></main>

	const userIsFriend = currentUser.friends.some(friend => friend._id === data._id)
	const userIsCurrentUser = currentUser._id === data._id

	const work = () => {
		if (data.jobTitle && data.company) return (
			<span>Works as: <b>{data.jobTitle}</b> at <b>{data.company}</b></span>
		)
		else if (data.jobTitle && !data.company) return <span>Works as <b>{data.jobTitle}</b></span>
		else if (!data.jobTitle && data.company) return <span>Works at: <b>{data.company}</b></span>
		else return <span>Work:</span>
	}
	return (
		<main>
			<ProfileHeader key={currentUser._id} user={data} />
			<GridColumns>
				<Info>
					<About className='white-bg'>
						<h2>About</h2>
						<ul>
							<li>
								<img src={job} aria-hidden='true' />
								<p>{work()}</p>
							</li>
							<li>
								<img src={home} aria-hidden='true' />
								<p>Lives in: <b>{data.location}</b></p>
							</li>
							<li>
								<img src={email} aria-hidden='true' />
								<p>Email: <b>{data.email}</b></p>
							</li>
							<li>
								<img src={birthday} aria-hidden='true' />
								<p>Born: <b>{`${formatDate(data.dob)} (${getAge(data.dob)})`}</b></p>
							</li>
							<li>
								<img src={school} aria-hidden='true' />
								<p>Studied at: <b>{data.school}</b></p>
							</li>
							<li>
								<img src={hobbies} aria-hidden='true' />
								<p>Hobbies: <b>{data.hobbies}</b></p>
							</li>
							<li>
								<img src={animal} aria-hidden='true' />
								<p>Favourite Animal: <b>{data.favouriteAnimal}</b></p>
							</li>
							<li>
								<img src={clock} aria-hidden='true' />
								<p>Member since: <b>{formatDate(data.createdAt)}</b></p>
							</li>
						</ul>
					</About>
					<Friends className='white-bg'>
						<h2>{userIsFriend || userIsCurrentUser ? 'Friends' : 'Mutual Friends'}</h2>
						{data.friends.map(friend => <Friend key={friend._id} data={friend} /> )}
						{!data.friends.length &&
							<p>{userIsCurrentUser ?
								'You have not added any friends yet' :
								'You do not share any mutual friends with ' + data.firstname
							}</p>
						}
					</Friends>
				</Info>
				<UserPosts user={data} />
			</GridColumns>
		</main>
	)
}

function Friend ({data}: {data: UserMinimal}) {
	return (
		<FriendStyled>
			<img src={import.meta.env.VITE_SERVER + data.profilePicture} alt={data.fullname} />
			<Link to={`/user/${data._id}`}>
				<span>{data.fullname}</span>
			</Link>
		</FriendStyled>
	)
}

const GridColumns = styled.div`
	display: grid;
	grid-template-columns: 500px 1fr;
	gap: 60px;
	@media (max-width: ${DESKTOP}) {
		grid-template-columns: 1fr;
	}
`

const Info = styled.section`
	display: flex;
	flex-direction: column;
	gap: 20px;
	p {
		margin: 0;
		line-height: 1.2;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	li {
		display: flex;
		gap: 8px;
		align-items: center;
		margin-bottom: 10px;
	}
	li img {
		width: 32px;
		background: #6cabc0;
		border-radius: 50%;
		padding: 4px;
	}
`

const About = styled.div`
	h2 { margin-top: 0; }
`

const FriendStyled = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
	margin-bottom: 15px;
	img {
		width: 48px;
		border-radius: 50%;
	}
	a {
		color: currentColor;
		text-decoration: none;
		&:hover {
			text-decoration: underline;
			color: navy;
		}
	}
`

const Friends = styled.div`
	h2 { margin-top: 0; }
`
