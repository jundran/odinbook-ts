export type LoggedInUser = User & {
	isActive: boolean
	isDemoAccount: boolean
	demoAccountId?: number
	friends: UserMinimal[]
	incomingFriendRequests: UserMinimal[],
	outgoingFriendRequests: UserMinimal[],
	notifications: Notification[]
}

export type User = UserCommon & {
	dob: string
	email: string
	location: string
	jobTitle: string
	company: string
	school: string
	hobbies: string
	favouriteAnimal: string
	friends: UserMinimal[]
}

export type UserMinimal = UserCommon & {
	// User must be friend to see their online status
	isOnline?: boolean
}

type UserCommon = {
	_id: string
	firstname: string
	surname: string
	profilePicture: string
	fullname: string
	createdAt: string
	updatedAt: string
}

export type Message = {
	_id: string
	sender: string
	recipient: string
	text: string
	isRead: boolean
	createdAt: string
	updatedAt: string
}

export type Notification = {
	_id: string
	message: string
	user: UserMinimal
	type: string
	runtimeOnly?: boolean
	createdAt: string
	updatedAt?: string
}

export type Post = {
	_id: string
	user: UserMinimal
	text: string
	image: string
	likes: UserMinimal[]
	comments: Comment[]
	createdAt: string
	updatedAt: string
}

export type Comment = {
	_id: string
	user: UserMinimal
	text: string
	likes: UserMinimal[]
	createdAt: string
	updatedAt: string
}

export type APIErrorResponseData = {
	name: string
	status: number
	message: string
}
