import axios from 'axios'
import React,{ useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {storage} from '../firebase';
import {getDownloadURL, listAll, ref} from 'firebase/storage'

const Assignment = (props) => {
  const {assignment_id, assignment_name} = useParams()
  const {myUser} = props
  const assignmentsRef = ref(storage, "teacherAssignmentUploads/")
  const [assignment, setAssignment] = useState('')
  const [downloadUrls, setDownloadUrls] = useState([])

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
  return (
    <div className='profile-page'>
        <div className="profile-content">
            <div className='profile-header'>
                <h2>Assignments</h2>
            </div>
            {
                assignment ?
                <>
                    <h4>{assignment.name}</h4>
                    {
                        downloadUrls ?
                        <a href={downloadUrls.filter(downloadUrl => downloadUrl.includes(myUser.sub.slice(myUser.sub.length - 10) + assignment_name))} download={assignment.name}>Click here to Download</a>
                        : null
                    }
                    <a href='' download={assignment.name}></a>
                </>
                : null
            }
        </div>
    </div>
  )
}

export default Assignment