import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { SlNotebook } from 'react-icons/sl'
import {MdOutlineGrade} from 'react-icons/md'
import {SiGoogleclassroom} from 'react-icons/si'
import {BsPlusLg} from 'react-icons/bs'
import {useAuth0} from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import './components.css'
import NewClass from './NewClass'
import JoinClass from './JoinClass'
import NewAssignment from './NewAssignment'
import toast, { Toaster } from 'react-hot-toast'
import {storage} from '../firebase';
import {getDownloadURL, listAll, ref} from 'firebase/storage'

const Profile = (props) => {
  const {myUser} = props
  const {user} = useAuth0()
  const currentStudentID = myUser.sub.slice(myUser.sub.length - 10)
  const [currentUser, setCurrentUser] = useState('')
  const [myClasses, setMyClasses] = useState([])
  const [studentClasses, setStudentClasses] = useState([])
  const [myAssignments, setMyAssignments] = useState([])
  const [classForm, showClassForm] = useState(false)
  const [joinClass, showJoinClass] = useState(false)
  const [gradesForm, showGradesForm] = useState(false)
  const [assignmentsForm, showAssignmentsForm] = useState(false)
  const [allAssignments, setAllAssignments] = useState([])
  const oneUserAPI = `http://localhost:8000/api/user/oneUser/${user.sub}`
  const myClassesAPI = 'http://localhost:8000/api/class/myClasses/'
  const allClassesAPI = 'http://localhost:8000/api/class/allClasses/'
  const allAssignmentsAPI = 'http://localhost:8000/api/assignment/getAssignments'
  const assignmentsRef = ref(storage, "teacherAssignmentUploads/")
  const [downloadUrls, setDownloadUrls] = useState([])

  const showNotification = () => {
    toast.success('File uploaded!', {
      duration: 4000
    })
  }

  const createClass = () => {
    showClassForm(!classForm)
  }

  const joinCurrentClass = () => {
    showJoinClass(!joinClass)
  }

  const postAssignment = () => {
    showAssignmentsForm(!assignmentsForm)
  }

  const allClasses = (newClass) => {
    setMyClasses([...myClasses, newClass])
  }

  const addMyAssignment = (newAssignment) => {
    setMyAssignments([...myAssignments, newAssignment])
  }

  const allStudentClasses = (newClass) => {
    setStudentClasses([...studentClasses, newClass])
  }

  useEffect(() => {
    axios.get(oneUserAPI)
      .then(res => setCurrentUser(res.data[0]))
      .catch(err => console.log(err))
    axios.get(myClassesAPI + `${myUser.sub.slice(myUser.sub.length - 10)}`)
      .then(res => setMyClasses(res.data))
      .catch(err => console.log(err))
    axios.get(allClassesAPI)
      .then(res => setStudentClasses(res.data.filter(classroom => classroom.students.some(s => s.studentID === currentStudentID))))
      .catch(err => console.log(err))
    axios.get(allAssignmentsAPI)
      .then(res => setMyAssignments(res.data.filter(potentialAssignment => potentialAssignment.teacherID === myUser.sub.slice(myUser.sub.length - 10))))
      .catch(err => console.log(err))
    // listAll(assignmentsRef).then((res) => {
    //   res.items.forEach((item) => {
    //     getDownloadURL(item).then((url) => {
    //       setDownloadUrls((prev) => [...prev, url])
    //     })
    //   })
    // })
  }, [])

  return (
    <div className='profile-page'>
      <Toaster toastOptions={{
        success: {
          style: {
            border: '3px solid #18d55a'
          }
        },
        error: {
          style: {
            border: '3px solid red'
          }
        }
      }}/>
      <div className="profile-content">
        {currentUser ? 
          <div className='profile-header'>
            <h2>{currentUser.firstName} {currentUser.lastName}</h2>
            <label>{currentUser.position}</label>
          </div>
          : null
        }
        <ul className="tabs">
          <li className="tab-contents">
            <div className="tab-title">Classes</div>
            <div className="sub-contents">
              {/* -----TEACHER----- */}
              {
                currentUser  ? 
                currentUser.position === 'Teacher' ?
                  <>
                    <div className='create-button new-button' onClick={createClass}>
                      <SiGoogleclassroom size={50} style={{marginTop: 30, marginBottom: 15}}/>
                      <div className='button-desc'>
                        + New Class 
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
                : <>
                {/* -----STUDENT----- */}
                <div className='create-button new-button' onClick={joinCurrentClass}>
                  <SiGoogleclassroom size={50} style={{marginTop: 30, marginBottom: 15}}/>
                  <div className='button-desc'>
                    + Join Class 
                  </div>
                </div>
                {
                  studentClasses ?
                  studentClasses.map((myClass, i) => {
                    return <Link to={`/classes/${myClass.classID}`}><div key={i} className='create-button' onClick={createClass}>
                        <SiGoogleclassroom size={50} style={{marginTop: 30, marginBottom: 15}}/>
                        <div className='button-desc'>
                          {myClass.className}
                        </div>
                        <div className="button-desc">
                          Class ID: {myClass.classID}
                        </div>
                      </div>
                    </Link>
                  })
                  : null
                }
              </>
                : null
              }
            </div>
          </li>
          {
            currentUser  ? 
            currentUser.position === 'Student' ?
            <li className="tab-contents">
              <div className="tab-title">Grades</div>
              <div className="sub-contents">
                
                  
                    <div className='create-button'>
                      <MdOutlineGrade size={50} style={{marginTop: 30, marginBottom: 15}}/>
                      <div className='button-desc'>
                        My Grades 
                      </div>
                    </div>
                  
                  
              </div>
            </li>
            : null
            : null
          }
          <li className="tab-contents">
            <div className="tab-title">Assignments</div>
            <div className="sub-contents">
              {
                currentUser  ? 
                currentUser.position === 'Teacher' ?
                // -----TEACHER-----
                <>
                  <div className='create-button new-button' onClick={postAssignment}>
                    <SlNotebook size={50} style={{marginTop: 30, marginBottom: 15}}/>
                    <div className='button-desc'>
                      + Post Assignments
                    </div>
                  </div>
                  {
                    myAssignments ?
                    myAssignments.map((assignment, i) => {
                      return <Link to={`/assignment/${assignment._id}/${assignment.name}`} key={i}>
                        <div className='create-button'>
                          <SlNotebook size={50} style={{marginTop: 30, marginBottom: 15}}/>
                          <div className='button-desc'>
                            {assignment.name}
                          </div>
                        </div>
                      </Link>
                    })
                    : null
                  }
                </>
                // -----STUDENT-----
                : <div className='create-button'>
                    <SlNotebook size={50} style={{marginTop: 30, marginBottom: 15}}/>
                    <div className='button-desc'>
                      My Assignments
                    </div>
                  </div>
                : null
              }
            </div>
          </li>
        </ul>
      </div>
      {classForm && <NewClass allClasses={allClasses} createClass={createClass} currentUser={currentUser}/>}
      {joinClass && <JoinClass studentClasses={studentClasses} allStudentClasses={allStudentClasses} joinCurrentClass={joinCurrentClass} currentUser={currentUser}/>}
      {assignmentsForm && <NewAssignment myAssignments={myAssignments} addMyAssignment={addMyAssignment} myClasses={myClasses} showNotification={showNotification} myUser={myUser} postAssignment={postAssignment}/>}
    </div>
    )
}

export default Profile