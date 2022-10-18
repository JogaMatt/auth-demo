import React from 'react'
import './components.css'
import { useAuth0 } from '@auth0/auth0-react'

const LandingPage = () => {
  const {loginWithPopup, isLoading} = useAuth0()
  if(isLoading){
    return <div></div>
  }
  return (
    <div className='landing-page'>
        <div className="left-landing">
            <div className="header">
                Connecting Teachers and Students
            </div>
            <button className='start-button' onClick={loginWithPopup}>GET STARTED</button>
        </div>
        <div className="right-landing"/>
    </div>
  )
}

export default LandingPage