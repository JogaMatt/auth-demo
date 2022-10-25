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
  const {myUser, deleteNotification, assignmentsToPass, classesToPass} = props
  const {user} = useAuth0()
  const currentStudentID = myUser.sub.slice(myUser.sub.length - 10)
  const [currentUser, setCurrentUser] = useState('')
  const [myClasses, setMyClasses] = useState([])
  const [studentClasses, setStudentClasses] = useState([])
  const [studentAssignments, setStudentAssignments] = useState([])
  const [myAssignments, setMyAssignments] = useState([])
  const [submittedAssignments, setSubmittedAssignments] = useState([])
  const [classForm, showClassForm] = useState(false)
  const [joinClass, showJoinClass] = useState(false)
  const [gradesForm, showGradesForm] = useState(false)
  const [assignmentsForm, showAssignmentsForm] = useState(false)
  const [allAssignments, setAllAssignments] = useState([])
  const backend = 'http://localhost:8000'
  const oneUserAPI = `${backend}/api/user/oneUser/${user.sub}`
  const myClassesAPI = `${backend}/api/class/myClasses/`
  const allClassesAPI = `${backend}/api/class/allClasses/`
  const allAssignmentsAPI = `${backend}/api/assignment/getAssignments`
  const assignmentsRef = ref(storage, "teacherAssignmentUploads/")
  const submittedAssignmentsRef = ref(storage, "submittedAssignments/")
  const [downloadUrls, setDownloadUrls] = useState([])
  const userID = myUser.sub.slice(myUser.sub.length - 10)

  const uploadNotification = () => {
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
      .then(res => {
        setStudentClasses(res.data.filter(classroom => classroom.students.some(s => s.studentID === currentStudentID)))
        // classesToPass(res.data.filter(classroom => classroom.students.some(s => s.studentID === currentStudentID)))
      })
      .catch(err => console.log(err))
    axios.get(allAssignmentsAPI)
      .then(res => {
        setMyAssignments(res.data.filter(potentialAssignment => potentialAssignment.teacherID === userID))
        // assignmentsToPass(res.data)
        setStudentAssignments(res.data)
      })
      .catch(err => console.log(err))
      listAll(submittedAssignmentsRef).then((res) => {
        res.items.forEach((item) => {
            setSubmittedAssignments((prev) => [...prev, item._location.path_])
        })
      })
  }, [])

  const removedSubmissionNotification = () => {
    toast.success('Your submitted assignment has been removed. Be sure to submit it again!', {
      duration: 4000
    })
  }

  return (
    <div className='profile-page'>
      <Toaster toastOptions={{
        success: {
          style: {
            textAlign: 'center',
            border: '3px solid #18d55a'
          }
        },
        error: {
          style: {
            textAlign: 'center',
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
                        return <Link to={`/classes/${myClass.classID}`} key={i}><div className='create-button'>
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
                    return <Link key={i} to={`/classes/${myClass.classID}`}><div className='create-button' onClick={createClass}>
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
                
                  <Link to={`/myGrades/${userID}`}>
                    <div className='create-button new-button'>
                      <MdOutlineGrade size={50} style={{marginTop: 30, marginBottom: 15}}/>
                      <div className='button-desc'>
                        My Grades 
                      </div>
                    </div>
                  </Link>
                  
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
                      return <Link to={`/assignment/${assignment.teacherID}/${assignment.classID}/${assignment._id}/${assignment.name}`} key={i}>
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
                : 
                <>
                  <div className='create-button new-button'>
                    <SlNotebook size={50} style={{marginTop: 30, marginBottom: 15}}/>
                    <div className='button-desc'>
                      My Assignments
                    </div>
                  </div>
                  {
                    studentAssignments ?
                    studentAssignments.filter(potentialAssignment => studentClasses.some(s => s.classID === potentialAssignment.classID)).map((assignment, i) => {
                      return <Link to={`/assignment/${assignment.teacherID}/${assignment.classID}/${assignment._id}/${assignment.name}`} key={i}>
                        <div className='create-button'>
                          <SlNotebook size={50} style={{marginTop: 30, marginBottom: 15}}/>
                          <div className='button-desc'>
                            {assignment.name}
                          </div>
                          {
                            submittedAssignments ?
                            submittedAssignments.includes(`submittedAssignments/${assignment._id + userID + assignment.classID + assignment.name}`) ? <div className="button-desc">*COMPLETE*</div> : null : null
                          }
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
        </ul>
      </div>
      {classForm && <NewClass allClasses={allClasses} createClass={createClass} currentUser={currentUser}/>}
      {joinClass && <JoinClass studentClasses={studentClasses} allStudentClasses={allStudentClasses} joinCurrentClass={joinCurrentClass} currentUser={currentUser}/>}
      {assignmentsForm && <NewAssignment myAssignments={myAssignments} addMyAssignment={addMyAssignment} myClasses={myClasses} uploadNotification={uploadNotification} myUser={myUser} postAssignment={postAssignment}/>}
    </div>
    )
}

export default Profile