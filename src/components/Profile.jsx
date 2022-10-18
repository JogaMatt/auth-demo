import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { SlNotebook } from 'react-icons/sl'
import {MdOutlineGrade} from 'react-icons/md'
import {SiGoogleclassroom} from 'react-icons/si'
import {BsPlusLg} from 'react-icons/bs'
import {useAuth0} from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
// import JSONPretty from 'react-json-pretty'
import './components.css'
import NewClass from './NewClass'

const Profile = (props) => {
  const {myUser} = props
  const {user} = useAuth0()
  const [currentUser, setCurrentUser] = useState('')
  const [myClasses, setMyClasses] = useState([])
  const [classForm, showClassForm] = useState(false)
  const [gradesForm, showGradesForm] = useState(false)
  const [assignmentsForm, showAssignmentsForm] = useState(false)
  const oneUserAPI = `http://localhost:8000/api/user/oneUser/${user.sub}`
  const myClassesAPI = 'http://localhost:8000/api/class/myClasses/'

  const createClass = () => {
    showClassForm(!classForm)
  }

  const allClasses = (newClass) => {
    setMyClasses([...myClasses, newClass])
  }

  useEffect(() => {
    axios.get(oneUserAPI)
      .then(res => setCurrentUser(res.data[0]))
      .catch(err => console.log(err))
    axios.get(myClassesAPI + `${myUser.sub.slice(myUser.sub.length - 10)}`)
      .then(res => setMyClasses(res.data))
      .catch(err => console.log(err))
  }, [])

  return (
    <div className='profile-page'>
      <div className="profile-content">
        {currentUser ? <h2>{currentUser.firstName} {currentUser.lastName}</h2> : null}
        <ul className="tabs">
          <li className="tab-contents">
            <div className="tab-title">Classes</div>
            <div className="sub-contents">
              {
                currentUser  ? 
                currentUser.position === 'teacher' ?
                  <>
                    <div className='create-button' onClick={createClass}>
                      <SiGoogleclassroom size={50} style={{marginTop: 30, marginBottom: 15}}/>
                      <div className='button-desc'>
                        New Class <BsPlusLg/> 
                      </div>
                    </div>
                    {
                      myClasses ?
                      myClasses.map((myClass, i) => {
                        return <div className='create-button' onClick={createClass}>
                          <SiGoogleclassroom size={50} style={{marginTop: 30, marginBottom: 15}}/>
                          <div className='button-desc'>
                            {myClass.className}
                          </div>
                          <div className="button-desc" style={{color: '#05aae1'}}>
                            Class ID: {myClass.classID}
                          </div>
                        </div>
                      })
                      : null
                    }
                  </>
                : <>
                <div className='create-button' onClick={createClass}>
                  <SiGoogleclassroom size={50} style={{marginTop: 30, marginBottom: 15}}/>
                  <div className='button-desc'>
                    Join Class <BsPlusLg/> 
                  </div>
                </div>
                {
                  myClasses ?
                  myClasses.map((myClass, i) => {
                    return <div className='create-button' onClick={createClass}>
                      <SiGoogleclassroom size={50} style={{marginTop: 30, marginBottom: 15}}/>
                      <div className='button-desc'>
                        {myClass.className}
                      </div>
                      <div className="button-desc">
                        Class ID: {myClass.classID}
                      </div>
                    </div>
                  })
                  : null
                }
              </>
                : null
              }
            </div>
          </li>
          <li className="tab-contents">
            <div className="tab-title">Grades</div>
            <div className="sub-contents">
              {
                currentUser  ? 
                currentUser.position === 'teacher' ?
                
                  <div className='create-button'>
                    <MdOutlineGrade size={50} style={{marginTop: 30, marginBottom: 15}}/>
                    <div className='button-desc'>
                      Post Grades <BsPlusLg/> 
                    </div>
                  </div>
                
                : null
                : null
              }
            </div>
          </li>
          <li className="tab-contents">
            <div className="tab-title">Assignments</div>
            <div className="sub-contents">
              {
                currentUser  ? 
                currentUser.position === 'teacher' ?
                
                  <div className='create-button'>
                    <SlNotebook size={50} style={{marginTop: 30, marginBottom: 15}}/>
                    <div className='button-desc'>
                      Post Assignments <BsPlusLg/> 
                    </div>
                  </div>
                
                : null
                : null
              }
            </div>
          </li>
        </ul>
      </div>
      {classForm && <NewClass allClasses={allClasses} createClass={createClass} currentUser={currentUser}/>}
    </div>
    )
}

export default Profile