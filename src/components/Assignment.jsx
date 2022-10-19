import axios from 'axios'
import React,{ useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {storage} from '../firebase';
import {getDownloadURL, listAll, ref, deleteObject} from 'firebase/storage'
import { SlNotebook } from 'react-icons/sl';

const Assignment = (props) => {
  const {assignment_id, assignment_name} = useParams()
  const {myUser, deleteNotification} = props
  const assignmentsRef = ref(storage, "teacherAssignmentUploads/")
  const [assignment, setAssignment] = useState('')
  const [downloadUrls, setDownloadUrls] = useState([])
  const navigate = useNavigate()

  const deleteAPI = `http://localhost:8000/api/assignment/deleteAssignment/${assignment._id}`
  const oneAssignmentAPI = `http://localhost:8000/api/assignment/getOneAssignment/${assignment_id}`

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
  }, [])

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
                        {
                            downloadUrls ?
                            <a href={downloadUrls.filter(downloadUrl => downloadUrl.includes(myUser.sub.slice(myUser.sub.length - 10) + assignment_name))} download={assignment.name}>Click here to Download</a>
                            : null
                        }
                        <a href='' download={assignment.name}></a>
                    </div>
                </div>
                : null
            }
            <div className="bottom-assignment-content">
                <button className='delete-button' onClick={deleteAssignment}>DELETE ASSIGNMENT</button>
            </div>
        </div>
    </div>
  )
}

export default Assignment