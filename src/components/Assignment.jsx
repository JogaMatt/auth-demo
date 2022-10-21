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
  const {myUser, deleteNotification} = props
  const assignmentsRef = ref(storage, "teacherAssignmentUploads/")
  const submittedAssignmentsRef = ref(storage, "submittedAssignments/")
  const [assignment, setAssignment] = useState('')
  const [submitAssignment, showSubmitAssignment] = useState(false)
  const [downloadUrls, setDownloadUrls] = useState([])
  const [submittedAssignments, setSubmittedAssignments] = useState([])
  const navigate = useNavigate()
  const userID = myUser.sub.slice(myUser.sub.length - 10)
  const backend = 'http://localhost:8000'

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
  }, [])

  const toggleSubmitAssignment = () => {
    showSubmitAssignment(!submitAssignment)
  }

  const deleteAssignment = () => {
    const deleteRef = ref(storage, `teacherAssignmentUploads/${assignment.teacherID}${assignment.name}`)
    deleteObject(deleteRef)
        .then(res => {
            removeFromDB()
            navigate('/profile')
            deleteNotification()
        })
        .catch(err => console.log(err))
  }

  const removeFromDB = () => {
    axios.delete(deleteAPI)
        .then(res => console.log('Assignment deleted'))
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
        <div className="profile-content">
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
                        <h4>{assignment.name}</h4>
                    </div>
                </div>
                : null
            }
            <div className="bottom-assignment-content">
                {
                  downloadUrls && assignment.teacherID !== userID ?
                    <>
                      <a className='download-button' href={downloadUrls.filter(downloadUrl => downloadUrl.includes((assignment.teacherID) + assignment_name))} download={assignment.name}>
                        <button className="download-button">CLICK HERE TO DOWNLOAD</button>
                      </a>
                      {
                        submittedAssignments.length === 0 ?
                        <button className="download-button submit-button" onClick={toggleSubmitAssignment}>SUBMIT ASSIGNMENT</button>
                        : <button className="submitted-button">UPDATE SUBMITTED ASSIGNMENT</button>
                      }
                    </>
                  : <button className='delete-button' onClick={deleteAssignment}>DELETE ASSIGNMENT</button>
                }
            </div>
        </div>
        {submitAssignment && <SubmitAssignment toggleSubmitAssignment={toggleSubmitAssignment} uploadNotification={uploadNotification} myUser={myUser} assignment_id={assignment_id} classID={assignment.classID} dueDate={assignment.dueDate}/>}
    </div>
  )
}

export default Assignment