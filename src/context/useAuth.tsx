import { useContext } from 'react'
import { AuthContext } from './authContext'

// Keeping this hook in a separate file so that react refresh works for authContext.ts
// React refresh only works when a module only exports components
export default function useAuth () {
	return useContext(AuthContext)
}
