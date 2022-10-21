import axios from 'axios'
import React,{ useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {storage} from '../firebase';
import {getDownloadURL, listAll, ref, deleteObject} from 'firebase/storage'
import { SlNotebook } from 'react-icons/sl';
import SubmitAssignment from './SubmitAssignment';
import toast, {Toaster} from 'react-hot-toast'

const Assignment = (props) => {
  const {assignment_classID, assignment_id, assignment_name} = useParams()
  const {myUser, deleteNotification, disclaimerNotification} = props
  const assignmentsRef = ref(storage, "teacherAssignmentUploads/")
  const submittedAssignmentsRef = ref(storage, "submittedAssignments/")
  const [assignment, setAssignment] = useState('')
  const [submitAssignment, showSubmitAssignment] = useState(false)
  const [downloadUrls, setDownloadUrls] = useState([])
  const [submittedAssignments, setSubmittedAssignments] = useState([])
  const navigate = useNavigate()
  const userID = myUser.sub.slice(myUser.sub.length - 10)
  const backend = 'http://localhost:8000'
  const [dbUser, setDbUser] = useState('')
  const [assignmentsFromDB, setAssignmentsFromDB] = useState([])
  const submittedAssignmentsFromDB = `${backend}/api/assignment/getAssignmentsForOneClass/${assignment_classID}`
  const [studentDownloadUrls, setStudentDownloadUrls] = useState([])

  const currentUserAPI = `${backend}/api/user/oneUser/${myUser.sub}`
  const deleteAPI = `${backend}/api/assignment/deleteAssignment/${assignment_id}`
  const oneAssignmentAPI = `${backend}/api/assignment/getOneAssignment/${assignment_id}`

  const uploadNotification = () => {
    toast.success('File uploaded!', {
      duration: 4000
    })
  }


  useEffect(() => {
    axios.get(oneAssignmentAPI)
        .then(res => setAssignment(res.data[0]))
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
    deleteObject(deleteRef)
      .then(res => 
        submittedAssignments.forEach((firebase_assignment) => {
          const newDeleteRef = ref(storage, firebase_assignment)
          deleteObject(newDeleteRef)
            .then(res => console.log('Student Assignment Deleted'))
            .catch(err => console.log(err))
    }))
      .then(res => {
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
                        : <button className="submitted-button">UPDATE SUBMITTED ASSIGNMENT</button>
                      }
                    </>
                  : <button className='delete-button' onClick={deleteAssignment}>DELETE ASSIGNMENT</button>
                }
            </div>
            <div className="bottom-assignment-table">
                
                  {
                  dbUser ?
                  dbUser[0].position === 'Teacher' ?
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
                                  <th className='assignment-tab-title'>Download</th>
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
                                          {
                                              downloadUrls ?
                                              <td>
                                                  <a href={downloadUrls.filter(url => url.includes(studentAssignment.studentID))} download={studentAssignment.name}>
                                                      <button className='assignment-download-button'>View</button>
                                                  </a>
                                              </td>
                                              : null
                                          }
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
    </div>
  )
}

export default Assignment