import styled from 'styled-components'
import { getTimeFrame } from '../utilities/time'
import { SimpleLinkMajor } from '../styles/sharedComponentStyles'
import { Post } from '@databaseTypes'

export default function PostHeader ({ data }: { data: Post }) {
	return (
		<Container>
			<div>
				<SimpleLinkMajor to={`/user/${data.user._id}`}>
					{data.user.fullname}
				</SimpleLinkMajor>
			</div>
			<div>
				<Time>{getTimeFrame(data.createdAt)}</Time>
			</div>
		</Container>
	)
}

const Container = styled.div`
	font-size: 90%;
`

const Time = styled.span`
	font-size: 80%;
	color: #444;
`
