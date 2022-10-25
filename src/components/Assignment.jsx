import axios from 'axios'
import React,{ useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {storage} from '../firebase';
import {getDownloadURL, listAll, ref, deleteObject} from 'firebase/storage'
import { SlNotebook } from 'react-icons/sl';
import SubmitAssignment from './SubmitAssignment';
import toast, {Toaster} from 'react-hot-toast'
import Grading from './Grading';
import Resubmit from './Resubmit';

const Assignment = (props) => {
  const navigate = useNavigate()
  const {assignment_teacherID, assignment_classID, assignment_id, assignment_name} = useParams()
  const {myUser, deleteNotification, disclaimerNotification, removedSubmissionNotification, dbUsers} = props
  const assignmentsRef = ref(storage, "teacherAssignmentUploads/")
  const submittedAssignmentsRef = ref(storage, "submittedAssignments/")
  const [assignment, setAssignment] = useState('')
  const [submitAssignment, showSubmitAssignment] = useState(false)
  const [downloadUrls, setDownloadUrls] = useState([])
  const [submittedAssignments, setSubmittedAssignments] = useState([])
  const userID = myUser.sub.slice(myUser.sub.length - 10)
  const backend = 'http://localhost:8000'
  const [dbUser, setDbUser] = useState('')
  const [assignmentsFromDB, setAssignmentsFromDB] = useState([])
  const submittedAssignmentsFromDB = `${backend}/api/assignment/getAssignmentsForOneClass/${assignment_classID}`
  const [studentDownloadUrls, setStudentDownloadUrls] = useState([])
  const [showGrading, setShowGrading] = useState(false)
  const [forwardAssignment, setForwardAssignment] = useState('')
  const [gradedAssignments, setGradedAssignments] = useState([])
  const gradedAssignmentsRef = ref(storage, 'gradedAssignments/')
  const [gradedFromFB, setGradedFromFB] = useState([])
  const [showResubmit, setShowResubmit] = useState(false)
  const [gradedFromDB, setGradedFromDB] = useState('')


  const currentUserAPI = `${backend}/api/user/oneUser/${myUser.sub}`
  const deleteAPI = `${backend}/api/assignment/deleteAssignment/${assignment_id}`
  const oneAssignmentAPI = `${backend}/api/assignment/getOneAssignment/${assignment_id}`
  const gradedAssignmentsAPI = `${backend}/api/grade/allGrades`
  const oneGradedAssignmentFromDB = `${backend}/api/grade/thisAssignment/${assignment_id}`
  const removeAllGradesForAssignmentAPI = `${backend}/api/grade/deleteAllAssignmentsGrades/${assignment_id}`

  const uploadNotification = () => {
    toast.success('File uploaded!', {
      duration: 4000
    })
  }

  const gradeNotification = (studentName) => {
    toast.success(`${studentName}'s grade has been submitted!`, {
      duration: 4000
    })
  }

  const removeGradedNotification = (studentName) => {
    toast.success(`${studentName}'s grade has been removed! Time to grade it again!`, {
      duration: 6000
    })
  }

  const addToGraded = (graded) => {
    setGradedAssignments([...gradedAssignments, graded])
  }

  const freshGradedAssignments = (arr) => {
    setGradedAssignments(arr)
  }

  const freshSubmittedFromFB = (arr) => {
    setSubmittedAssignments(arr)
  }

  useEffect(() => {
    // console.log(dbUsers.filter(oneUser => oneUser.userID.slice(oneUser.userID.length - 10) === userID)[0].position)
    if(dbUsers.filter(oneUser => oneUser.userID.slice(oneUser.userID.length - 10) === userID)[0].position === 'Teacher' && userID !== assignment_teacherID){
      navigate('/profile')
    }
    axios.get(oneGradedAssignmentFromDB)
        .then(res => {
            setGradedFromDB(res.data.filter(grade => grade.studentID === userID))
          })
        .catch(err => console.log(err))
    axios.get(oneAssignmentAPI)
        .then(res => setAssignment(res.data[0]))
        .catch(err => console.log(err))
    axios.get(gradedAssignmentsAPI)
        .then(res => setGradedAssignments(res.data.filter(graded => graded.assignmentID === assignment_id)))
        .catch(err => console.log(err))
    listAll(assignmentsRef).then((res) => {
        res.items.forEach((item) => {
            getDownloadURL(item).then((url) => {
            setDownloadUrls((prev) => [...prev, url])
          })
        })
      })
    listAll(submittedAssignmentsRef).then((res) => {
      res.items.forEach((item) => {
        if(item._location.path_ === `submittedAssignments/${assignment_id + userID + assignment_classID + assignment_name}`){
          setSubmittedAssignments((prev) => [...prev, item._location.path_])
        }
      })
    })
    listAll(gradedAssignmentsRef).then((res) => {
      res.items.forEach((item) => {
        if(item._location.path_.includes(assignment_id)){
          setGradedFromFB((prev) => [...prev, item._location.path_])
        }
      })
    })
    axios.get(currentUserAPI)
        .then(res => setDbUser(res.data))
        .catch(err => console.log(err))
    axios.get(submittedAssignmentsFromDB)
        .then(res => {
            // console.table(res.data)
            setAssignmentsFromDB(res.data.filter(dbAssignment => dbAssignment._id === assignment_id)[0])
          })
        .catch(err => console.log(err))
    listAll(submittedAssignmentsRef).then((res) => {
        res.items.forEach((item) => {
            if(item._location.path_.includes(assignment_classID)){
                setSubmittedAssignments((prev) => [...prev, item._location.path_])
            }
            getDownloadURL(item).then((url) => {
                if(url.includes(assignment_classID)){
                    setDownloadUrls((prev) => [...prev, url])
                }
            })
        })
      })
  }, [])

  const toggleSubmitAssignment = () => {
    showSubmitAssignment(!submitAssignment)
  }



  const deleteAssignment = () => {
    const deleteRef = ref(storage, `teacherAssignmentUploads/${assignment.teacherID}${assignment.name}`)
    // REMOVE ASSIGNMENT FROM TEACHER_ASSIGNMENT_UPLOADS IN FIREBASE
    deleteObject(deleteRef)
      .then(res => 
      // REMOVE ASSIGNMENT FROM STUDENT_ASSIGNMENT_UPLOADS IN FIREBASE
        submittedAssignments.forEach((firebase_assignment) => {
          const newDeleteRef = ref(storage, firebase_assignment)
          deleteObject(newDeleteRef)
            .then(res => 
          // REMOVE GRADED ASSIGNMENT FROM GRADED_ASSIGNMENTS IN FIREBASE
              gradedFromFB.forEach((gradedFB) => {
                const gradedDeleteRef = ref(storage, gradedFB)
                deleteObject(gradedDeleteRef)
                  .then(res => 
                    // REMOVE GRADED ASSIGNMENT FROM MONGODB
                    axios.delete(removeAllGradesForAssignmentAPI)
                      .then(res => console.log('The job is done'))
                      .catch(err => console.log(err)))
              })
              )
            .catch(err => console.log(err))
    }))
      .then(res => {
        // REMOVE ASSIGNMENT FROM MONGODB
          removeFromDB()
          navigate('/profile')
        })
      .catch(err => console.log(err))
  }

  const removeFromDB = () => {
    axios.delete(deleteAPI)
        .then(res => {
          disclaimerNotification()
          deleteNotification()
          })
        .catch(err => console.log(err))
  }

  const loadingMsg = () => {
    return <div></div>
  }

  const showComponent = (obj) => {
    setShowGrading(!showGrading)
    setForwardAssignment(obj)
  }

  const closeComponent = () => {
    setShowGrading(!showGrading)
  }

  const resubmit = () => {
    setShowResubmit(!showResubmit)
  }

  const closeResubmit = () => {
    setShowResubmit(!showResubmit)
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
        <div className="profile-content" style={{width: '40vw'}}>
            <div className='profile-header'>
                <h2 style={{textAlign: 'center'}}>Assignment</h2>
            </div>
            {
                assignment ?
                <div className='assignment-content'>
                    <div className="left-assignment-content">
                        <div className='create-button assignment-button'>
                          <SlNotebook size={50} style={{marginTop: 30, marginBottom: 15}}/>
                          <div className='button-desc'>
                            {assignment.name}
                          </div>
                        </div>
                    </div>
                    <div className="right-assignment-content">
                        <h2 className="assignment-name" style={{textAlign: 'center'}}>{assignment.name}</h2>
                        <h4 style={{textAlign: 'center', color: 'red', marginBottom: 30}}>Due Date: {assignment.dueDate}</h4>
                        <h4>About this assignment: </h4>
                        <p className="assignment-desc">{assignment.description}</p>
                        
                    </div>
                </div>
                : null
            }
            <div className="bottom-assignment-content">
                {
                  downloadUrls && assignment.teacherID !== userID ?
                    <>
                      <a className='download-button' href={downloadUrls.filter(downloadUrl => downloadUrl.includes((assignment.teacherID) + assignment_name))} download={'hello'}>
                        <button className="download-button">CLICK HERE TO DOWNLOAD</button>
                      </a>
                      {
                        !submittedAssignments.includes(`submittedAssignments/${assignment_id + userID + assignment_classID + assignment_name}`) ?
                        <button className="download-button submit-button" onClick={toggleSubmitAssignment}>SUBMIT ASSIGNMENT</button>
                        : gradedFromDB ? 
                        gradedFromDB.length === 1 ?
                        <button className="submitted-button" style={{cursor: 'default'}}>ASSIGNMENT GRADED</button>
                        : <button className="submitted-button" onClick={resubmit}>UPDATE SUBMITTED ASSIGNMENT</button>
                        : null
                      }
                    </>
                  : <button className='delete-button' onClick={deleteAssignment}>DELETE ASSIGNMENT</button>
                }
            </div>
            <div className="bottom-assignment-table">
                
                  {
                  dbUser && gradedAssignments ?
                  dbUser[0].position === 'Teacher' ?
                  submittedAssignments && submittedAssignments.length === 0 ?
                  loadingMsg() :
                  <>
                      <div className="tab-title" style={{width: 'max-content'}}>Submitted Assignments</div>
                      <table className='assignment-table'>
                          <thead className='assignment-table-head'>
                              <tr className='assignment-table-title-row'>
                                  <th className='assignment-tab-title'>Student ID</th>
                                  <th className='assignment-tab-title'>Student Name</th>
                                  <th className='assignment-tab-title'>Assignment Name</th>
                                  <th className='assignment-tab-title'>Due Date</th>
                                  <th className='assignment-tab-title'>Date Submitted</th>
                                  <th className='assignment-tab-title'>Status</th>
                                  <th className='assignment-tab-title'>Actions</th>
                              </tr>
                          </thead>
                          <tbody>
                              {
                                  assignmentsFromDB ?
                                  assignmentsFromDB.submitted ?
                                  assignmentsFromDB.submitted.map((studentAssignment, i) => {
                                      return <tr className='assignment-table-title-row' key={i}>
                                          <td>{studentAssignment.studentID}</td>
                                          <td>{studentAssignment.studentName}</td>
                                          <td>{studentAssignment.name}</td>
                                          <td>{studentAssignment.dueDate}</td>
                                          <td>{studentAssignment.dateSubmitted}</td>
                                          {
                                              studentAssignment.dueDate > studentAssignment.dateSubmitted ?
                                              <td style={{color: '#28d928'}}>On Time</td>
                                              : <td style={{color: 'red'}}>Late</td>
                                          }
                                          <td style={{display: 'flex', justifyContent: 'space-evenly', paddingTop: 6}}>
                                            {
                                                downloadUrls ?
                                                  <>
                                                    <a href={downloadUrls.filter(url => url.includes(studentAssignment.studentID))} download={studentAssignment.name}>
                                                        <button className='assignment-download-button'>VIEW</button>
                                                    </a>
                                                    <button className="assignment-download-button grade-button" onClick={() => showComponent(studentAssignment)}>
                                                      GRADE
                                                    </button>
                                                  </>
                                                : null
                                            }
                                            
                                          </td>
                                      </tr>
                                  })
                                  : null : null
                              }
                          </tbody>
                      </table>
                      </>
                      : null : null
                  }
                </div>
        </div>
        {submitAssignment && <SubmitAssignment toggleSubmitAssignment={toggleSubmitAssignment} uploadNotification={uploadNotification} myUser={myUser} assignment_id={assignment_id} assignment_name={assignment.name} classID={assignment.classID} dueDate={assignment.dueDate}/>}
        {showGrading && <Grading removeGradedNotification={removeGradedNotification} freshGradedAssignments={freshGradedAssignments} gradedAssignments={gradedAssignments} addToGraded={addToGraded} gradeNotification={gradeNotification} studentAssignment={forwardAssignment} dbUser={dbUser} showComponent={closeComponent}/>}
        {showResubmit && <Resubmit removedSubmissionNotification={removedSubmissionNotification} freshSubmittedFromFB={freshSubmittedFromFB} assignment_name={assignment.name} classID={assignment.classID} submittedAssignments={submittedAssignments} closeResubmit={closeResubmit} studentID={userID} assignment_id={assignment_id} assignmentsFromDB={assignmentsFromDB}/>}
    </div>
  )
}

export default Assignment