import React, {useState} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {useAuth0} from '@auth0/auth0-react'
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Profile from './components/Profile';
import Assignment from './components/Assignment';


function App() {
  const {isAuthenticated, isLoading, user} = useAuth0()
  const [currentUser, setCurrentUser] = useState()

  const updateAppUser = (new_user) => {
    setCurrentUser(new_user)
  }

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar updateAppUser={updateAppUser} user={user}/>}
      <Routes>
        {!isAuthenticated && 
          <Route path='/' element={<LandingPage/>}/>
        }
        {isAuthenticated &&
          <>
            <Route path='/' element={<HomePage updateAppUser={updateAppUser} user={user} currentUser={currentUser}/>}/>
            <Route path='/profile' element={<Profile myUser={user}/>}/>
            <Route path='/assignment/:assignment_id/:assignment_name' element={<Assignment myUser={user}/>}/>
          </>
        }
      </Routes>
      {
        !isLoading ? <Footer/> : null
      }
    </BrowserRouter>
  );
}

export default App;
