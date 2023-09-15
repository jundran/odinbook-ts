import { HashRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'
import useAuth from './context/useAuth'
import Header from './components/header'
import Footer from './components/footer'
import HomePageLoggedOut from './pages/homePageLoggedOut'
import HomePageLoggedIn from './pages/homePageLoggedIn'
import UserPage from './pages/userPage'
import EditProfilePage from './pages/editProfilePage'
import FriendsPage from './pages/friendsPage'
import PeoplePage from './pages/peoplePage'
import AboutPage from './pages/aboutPage'
import ChatPage from './pages/chatPage'

export default function App () {
	const { user } = useAuth()

	return (
		<HashRouter>
			<Header />
			<Routes>
				<Route path='/' element={user ? <HomePageLoggedIn /> : <HomePageLoggedOut />} />
				<Route path='/profile' element={user ? <UserPage /> : <HomePageLoggedOut />} />
				<Route path='/profile/edit' element={user ? <EditProfilePage /> : <HomePageLoggedOut />} />
				<Route path='/user/:id' element={user ? <UserPage /> : <HomePageLoggedOut />} />
				<Route path='/friends' element={user ? <FriendsPage /> : <HomePageLoggedOut />} />
				<Route path='/people' element={user ? <PeoplePage /> : <HomePageLoggedOut />} />
				<Route path='/chat' element={user ? <ChatPage /> : <HomePageLoggedOut />} />
				<Route path='/about' element={<AboutPage />} />
				<Route path='*' element={<main><h1>Page not found - 404</h1></main>} />
			</Routes>
			<Footer />
			<div id="modal"></div>
		</HashRouter>
	)
}
