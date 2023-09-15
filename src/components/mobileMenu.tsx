import styled from 'styled-components'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DESKTOP } from '../styles/sharedComponentStyles'

type HamburgerProps = {
	showMenu: boolean
	setShowMenu: () => void
}
export function Hamburger ({ showMenu, setShowMenu }: HamburgerProps) {
	return (
		<HamburgerStyled $active={showMenu} onClick={setShowMenu}>
			<span />
		</HamburgerStyled>
	)
}

type MobileMenuProps = {
	isOpen: boolean
	close: () => void
}
export function MobileMenu ({ isOpen, close }: MobileMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()

	useEffect(() => {
		if (isOpen) {
			Array.from(menuRef.current!.children)
				.forEach(child => (child as HTMLElement).inert = false)
		} else {
			Array.from(menuRef.current!.children)
				.forEach(child => (child as HTMLElement).inert = true)
		}
	}, [isOpen])

	function handleClick (path: string) {
		close()
		navigate(path)
	}

	return (
		<Menu ref={menuRef} $isOpen={isOpen}>
			<button onClick={() => { handleClick('/') }}>Feed</button>
			<button onClick={() => { handleClick('/friends') }}>Friends</button>
			<button onClick={() => { handleClick('/people') }}>People</button>
			<button onClick={() => { handleClick('/profile') }}>Profile</button>
			<button onClick={() => { handleClick('/about') }}>About</button>
			<button onClick={close}>Close</button>
		</Menu>
	)
}

const HamburgerStyled = styled.button<{ $active: boolean }>`
	display: none;
	@media (max-width: ${DESKTOP}) { display: block; }
	padding: 16px 8px;
	border: none;
	background: none;
	span {
		display: block;
		position: relative;
	}
	span,
	span::before,
	span::after {
		border-radius: 1px;
		width: 16px;
		height: 3px;
		background: #fff;
	}
	span::before,
	span::after {
		content: '';
		position: absolute;
		left: 0;
	}
	span::before {
		bottom: 6px;
	}
	span::after {
		top: 6px;
	}
`

const Menu = styled.div<{ $isOpen: boolean }>`
	width: 100vw;
	height: ${props => props.$isOpen ? '650px' : '0'};
	transition: height linear 200ms;
	overflow: ${props => props.$isOpen ? 'scroll' : 'hidden'};

	display: none;
	@media (max-width: ${DESKTOP}) { display: flex; }
	flex-direction: column;
	align-items: center;
	background: #202060;
	color: #fff;
	button {
		padding: 32px;
		font-size: 2rem;
		color: inherit;
		outline-offset: -15px;
		background: none;
		border: none;
	}
`
