import React, {useState} from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {useAuth0} from '@auth0/auth0-react'
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Profile from './components/Profile';
import Assignment from './components/Assignment';
import Class from './components/Class';
import toast from 'react-hot-toast'


function App() {
  const {isAuthenticated, isLoading, user} = useAuth0()
  const [currentUser, setCurrentUser] = useState()

  const updateAppUser = (new_user) => {
    setCurrentUser(new_user)
  }

  const deleteNotification = () => {
    toast.success('Assignment deleted!', {
      duration: 4000
    })
  }

  const disclaimerNotification = () => {
    toast.success('If assignment is still visible in your assignment list, please refresh your page', {
      duration: 8000
    })
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
            <Route path='/profile' element={<Profile myUser={user} deleteNotification={deleteNotification}/>}/>
            <Route path='/classes/:classID' element={<Class myUser={user}/>}/>
            <Route path='/assignment/:assignment_classID/:assignment_id/:assignment_name' element={<Assignment disclaimerNotification={disclaimerNotification} deleteNotification={deleteNotification} myUser={user}/>}/>
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
