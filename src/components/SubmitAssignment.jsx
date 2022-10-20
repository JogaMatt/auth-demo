import React,{ useState, useEffect } from 'react'
import axios from 'axios'
import { SlNotebook } from 'react-icons/sl'
import {storage} from '../firebase'
import {getDownloadURL, listAll, ref, uploadBytes} from 'firebase/storage'
import {v4} from 'uuid'
import './components.css'
import Form from 'react-bootstrap/Form'
import toast, {Toaster} from 'react-hot-toast'


const SubmitAssignment = (props) => {
  const { myUser, toggleSubmitAssignment, assignment_id, uploadNotification} = props
  const [fileUpload, setFileUpload] = useState(null)
  const [assignment, setMyAssignment] = useState({
    name: '',
    assignmentID: assignment_id,
    studentID: myUser.sub.slice(myUser.sub.length - 10),
  })
  const fileSizeLimit = 1000000
  const backend = 'http://localhost:8000'
  const userID = myUser.sub.slice(myUser.sub.length - 10)

  const submitAssignmentAPI = `${backend}/api/assignment/submit/${assignment_id}`

  const uploadFile = (e) => {
    e.preventDefault()
    if(fileUpload === null || fileUpload === undefined){
      toast.error('No file uploaded', {
        duration: 4000
      })
    } else {
        toast.success('Submitting...', {
            duration: 4000
        })
        const fileRef = ref(storage, `submittedAssignments/${assignment_id + userID + fileUpload.name.replace(/\s/g, '_')}`);
        uploadBytes(fileRef, fileUpload)
        .then(() => {
            submitHomework(e)
            toggleSubmitAssignment()
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

  const submitHomework = (e) => {
    e.preventDefault()
    axios.put(submitAssignmentAPI, {
        name: assignment.name.substring(12).replace(/\s/g, '_'),
        studentID: assignment.studentID
    })
        .then(res => console.log('Assignment Submitted'))
        .catch(err => console.log(err))
  }

  return (
    <div className='new-user'>
        <div className="new-user-form">
            <div className="welcome">Submit Assignment</div>
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
                {/* <select className='class-selector' name="classID" onChange={changeHandler}>
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
                <input type="date" name="dueDate" className='class-selector' onChange={changeHandler} /> */}
                {
                    fileUpload && (fileUpload.size/fileSizeLimit) > 1000 ?
                    <div className="too-large">FILE EXCEEDS SIZE LIMIT (100MB) </div>
                    : <button className='form-button'>SUBMIT ASSIGNMENT</button>
                }
            </form>
            <div className="cancel" style={{marginTop: 15, cursor: 'pointer'}} onClick={toggleSubmitAssignment}>
              Close
            </div>
        </div>
    </div>
  )
}

export default SubmitAssignment