import React, {useState, useEffect} from 'react'
import axios from 'axios'
import {Link} from 'react-router-dom'
import {FiLogOut} from 'react-icons/fi'
import {SlNotebook} from 'react-icons/sl'
import {SiGoogleclassroom} from 'react-icons/si'
import {MdOutlineGrade} from 'react-icons/md'
import {IoHomeOutline} from 'react-icons/io5'
import { useAuth0 } from '@auth0/auth0-react'
import './components.css'
import NewUser from './NewUser'
import { Toaster } from 'react-hot-toast'

const Navbar = (props) => {
  const {user, updateAppUser} = props
  const {logout} =useAuth0()
  const [newUser, showNewUser] = useState(false)
  const [currentUser, setCurrentUser] = useState('')
  const oneUserAPI = `http://localhost:8000/api/user/oneUser/${user.sub}`

  const createdUser = (new_user) => {
    setCurrentUser(new_user)
    updateAppUser(new_user)
  }

  const toggleNewUser = () => {
    showNewUser(!newUser)
  }

  useEffect(() => {
    axios.get(oneUserAPI)
        .then(res => {
            setCurrentUser(res.data[0])
        })
        .catch(err => console.log(err))
  }, [oneUserAPI])

  return (
    <div className='navbar'>
        <div className="left-nav">
            <div className="temp-logo"/>
        </div>
        <div className="right-nav">
            <div className="buttons">
                {
                    currentUser ?
                    <Link to='/profile'><label className='link-title' style={{cursor: 'pointer'}}>Welcome, {currentUser.firstName}!</label></Link>
                    : <button className="start-button" onClick={toggleNewUser}>NEW USER</button>
                }
            </div>
            {
                currentUser ?
                    <div className="links">
                        <ul className='link-list'>
                            <Link to='/'><li className='link-title'>Home<IoHomeOutline size={20} style={{marginLeft: 10}}/></li></Link>
                            <Link to='/classes'><li className='link-title'>Classes<SiGoogleclassroom size={20} style={{marginLeft: 10}}/></li></Link>
                            {
                                currentUser.position === 'Student' ?
                                <Link to='/my-grades'><li className="link-title">Grades<MdOutlineGrade size={20} style={{marginLeft: 10}}/></li></Link>
                                : null
                            }
                            <Link to='/my-assignments'><li className="link-title">Assignments<SlNotebook size={20} style={{marginLeft: 10}}/></li></Link>
                            <li className="link-title" style={{cursor: 'pointer'}} onClick={logout}>Log Out<FiLogOut size={20} style={{marginLeft: 10}}/></li>
                        </ul>
                    </div>
                : <ul className="link-list">
                    <li className="link-title" style={{cursor: 'pointer'}} onClick={logout}><FiLogOut size={20} style={{marginRight: 5}}/>Log Out </li>
                  </ul>
            }
        </div>
        {newUser && <NewUser toggleNewUser={toggleNewUser} user={user} createdUser={createdUser}/>}
    </div>
  )
}

export default Navbar