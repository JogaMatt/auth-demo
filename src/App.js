import React, {useState, useEffect} from 'react';
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
import axios from 'axios';
import MyGrades from './components/MyGrades';


function App() {
  const {isAuthenticated, isLoading, user} = useAuth0()
  const [dbUsers, setDBUsers] = useState('')
  const [currentUser, setCurrentUser] = useState('')
  const backend = 'http://localhost:8000'
  const usersAPI = `${backend}/api/user/allUsers`

  const [myAssignments, setMyAssignments] = useState([])
  const [myClasses, setMyClasses] = useState([])

  const classesToPass = (arr) => {
    setMyClasses(arr)
  }

  const assignmentsToPass = (arr) => {
    setMyAssignments(arr)
  }

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

  const removedSubmissionNotification = () => {
    toast.success('Your submitted assignment has been removed. Be sure to submit it again!', {
      duration: 4000
    })
  }

  useEffect(() => {
    axios.get(usersAPI)
      .then(res => {
        setDBUsers(res.data)
      })
  }, [])

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
            <Route path='/profile' element={<Profile classesToPass={classesToPass} assignmentsToPass={assignmentsToPass} myUser={user} deleteNotification={deleteNotification}/>}/>
            <Route path='/classes/:classID' element={<Class myUser={user}/>}/>
            <Route path='/assignment/:assignment_teacherID/:assignment_classID/:assignment_id/:assignment_name' element={<Assignment removedSubmissionNotification={removedSubmissionNotification} disclaimerNotification={disclaimerNotification} deleteNotification={deleteNotification} myUser={user} dbUsers={dbUsers}/>}/>
            <Route path='/myGrades/:userID' element={<MyGrades myClasses={myClasses} myAssignments={myAssignments}/>}/>
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
