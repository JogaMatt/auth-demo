import React,{ useState, useEffect } from 'react'
import axios from 'axios'
import { SlNotebook } from 'react-icons/sl'
import {storage} from '../firebase'
import {getDownloadURL, listAll, ref, uploadBytes} from 'firebase/storage'
import {v4} from 'uuid'
import './components.css'
import Form from 'react-bootstrap/Form'
import toast, {Toaster} from 'react-hot-toast'


const NewAssignment = (props) => {
  const {postAssignment, myUser, uploadNotification, myClasses, myAssignments, addMyAssignment} = props
  const [fileUpload, setFileUpload] = useState(null)
  const [currentDate, setCurrentDate] = useState('')
  const [assignmentNames, setAssignmentNames] = useState([])
  const [assignment, setMyAssignment] = useState({
    name: '',
    classID: '',
    dueDate: '',
    teacherID: myUser.sub.slice(myUser.sub.length - 10),
    submitted: [],
    description: ''
  })
  const fileSizeLimit = 1000000
  const backend = 'http://localhost:8000'
  const postAssignmentAPI = `${backend}/api/assignment/post`
  const allAssignmentsAPI = `${backend}/api/assignment/getAssignments`

  const uploadFile = (e) => {
    e.preventDefault()
    if(fileUpload === null || fileUpload === undefined){
      toast.error('No file uploaded', {
        duration: 4000
      })
    } else if(assignmentNames.includes(assignment.name.substring(12).replace(/\s/g, '_'))){
        toast.error('Assignment name is already taken. Please try again.', {
          duration: 4000
        })
    } else if(assignment.classID === ''){
        toast.error('Please select a class', {
            duration: 4000
          })
    } else if(assignment.dueDate === ''){
      toast.error('Please confirm a due date', {
        duration: 4000
      })
    } else if(assignment.dueDate < currentDate){
      toast.error('Due date can not be a past date', {
        duration: 4000
      })
    } else if(assignment.description.length < 1){
      toast.error('Please enter an assignment description', {
        duration: 4000
      })
    } else {
        toast.success('Uploading...', {
            duration: 4000
        })
        const fileRef = ref(storage, `teacherAssignmentUploads/${myUser.sub.slice(myUser.sub.length - 10) + fileUpload.name.replace(/\s/g, '_')}`);
        uploadBytes(fileRef, fileUpload)
        .then(() => {
            addAssignmentToDB(e)
            postAssignment()
            uploadNotification()
        })
    }
  }

  const changeHandler = (e) => {
    setMyAssignment({
        ...assignment,
        [e.target.name]: e.target.value
    })
  }

  const changeFileName = (e) => {
    setFileUpload(e.target.files[0])
    setMyAssignment({
        ...assignment,
        [e.target.name]: e.target.value
    })
  }

  const addAssignmentToDB = (e) => {
    e.preventDefault()
    axios.post(postAssignmentAPI, {
        name: assignment.name.substring(12).replace(/\s/g, '_'),
        classID: assignment.classID,
        teacherID: assignment.teacherID,
        dueDate: assignment.dueDate,
        submitted: assignment.submitted,
        description: assignment.description
    })
        .then(res => {
            addMyAssignment(res.data)
        })
        .catch(err => console.log(err))
  }

  useEffect(() => {
    const currentDate = new Date()
    setCurrentDate(currentDate.toISOString().split('T')[0])
    axios.get(allAssignmentsAPI)
      .then(res => {
        res.data.forEach(assignment => {
          setAssignmentNames((prev) => [...prev, assignment.name])
        })
      })
  }, [])

  return (
    <div className='new-user'>
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
        <div className="new-user-form">
            <div className="welcome">Post Assignment</div>
            <form className='form' onSubmit={uploadFile}>
                <label className='file-advisor'>Need to upload multiple files? Zip all of your files together! <br/> (File size limit: 100MB)</label>
                {
                    fileUpload === null || fileUpload === undefined ?
                    <label htmlFor='file-upload' className='custom-file-upload'>
                        <SlNotebook/> Upload Assignment
                    </label>
                    :
                    <label htmlFor='file-upload' className='custom-file-upload uploaded'>
                        <SlNotebook size={25} style={{marginRight: 10}}/> {fileUpload.name}
                    </label>
                }
                <input id='file-upload' className='file-upload' type="file" name='name' onChange={changeFileName}/>
                <select className='class-selector' name="classID" onChange={changeHandler}>
                    <option value="">--Select a Class--</option>
                    {
                        myClasses ?
                        myClasses.map((myClass, i) => {
                            return <option key={i} value={myClass.classID}>{myClass.className}</option>
                        })
                        : null
                    }
                </select>
                <label className='due-date'>Due Date:</label>
                <input type="date" name="dueDate" className='class-selector' onChange={changeHandler} />
                <label className='due-date'>Assignment Description:</label>
                <textarea style={{width: 502, margin: '15px auto 30px'}} name="description" className='assignment-description' onChange={changeHandler}/>
                {
                    fileUpload && (fileUpload.size/fileSizeLimit) > 1000 ?
                    <div className="too-large">FILE EXCEEDS SIZE LIMIT (100MB) </div>
                    : <button className='form-button'>POST ASSIGNMENT</button>
                }
            </form>
            <div className="cancel" style={{marginTop: 15, cursor: 'pointer'}} onClick={postAssignment}>
              Close
            </div>
        </div>
    </div>
  )
}

export default NewAssignment