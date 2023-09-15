import { LoggedInUser, Message } from '@databaseTypes'

export type FriendStatusUpdate = {
	id: string
	isOnline: boolean
}

export type ServerToClientEvents = {
  userUpdate: (userDocument: LoggedInUser) => void
	message: (message: string) => void
	chatMessage: (message: Message) => void
	friendStatusUpdate: (status: FriendStatusUpdate) => void
}
