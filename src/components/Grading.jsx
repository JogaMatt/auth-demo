import axios from 'axios'
import React, {useEffect, useState} from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { SlNotebook } from 'react-icons/sl'
import {storage} from '../firebase'
import {getDownloadURL, listAll, ref, uploadBytes} from 'firebase/storage'
import './components.css'

const Grading = (props) => {
  // USEEFFECT
  useEffect(() => {
    setGradedAssignment(gradedAssignments.filter(graded => graded.studentID === studentAssignment.studentID))
  }, [])
  // PROPS
  const {dbUser, studentAssignment, showComponent, gradeNotification, addToGraded, gradedAssignments, freshGradedAssignments, removeGradedNotification} = props

  // STATES
  const [gradedAssignment, setGradedAssignment] = useState('')
  const [fileUpload, setFileUpload] = useState(null)
  const [studentGrade, setStudentGrade] = useState({
    assignmentName: studentAssignment.name,
    assignmentID: studentAssignment.assignmentID,
    assignmentDueDate: studentAssignment.dueDate,
    assignmentDateSubmitted: studentAssignment.dateSubmitted,
    studentName: studentAssignment.studentName,
    studentID: studentAssignment.studentID,
    comments: '',
    finalGrade: '',
    gradedAssignmentName: '',
  })

  // CONSTANTS
  const fileSizeLimit = 1000000
  const backend = 'http://localhost:8000'
  const submitGradeAPI = `${backend}/api/grade/submitGrade`

  // METHODS
  const changeHandler = (e) => {
    setStudentGrade({
      ...studentGrade, 
      [e.target.name]: e.target.value
    })
  }

  const changeFileName = (e) => {
    setFileUpload(e.target.files[0])
    setStudentGrade({
        ...studentGrade,
        [e.target.name]: e.target.value.slice(12)
    })
  }

  const submitGradeToDB = (e) => {
    e.preventDefault()
    axios.post(submitGradeAPI, studentGrade)
      .then(res => {
        addToGraded(res.data)
      })
      .catch(err => console.log(err))
  }

  const gradeAssignment = (e) => {
    e.preventDefault()
    if(fileUpload === null || fileUpload === undefined){
      toast.error('No file uploaded', {
        duration: 4000
      })
    } else if(studentGrade.comments.length < 15){
      toast.error('Remarks must be at least 15 characters', {
        duration: 4000
      })
    } else if(studentGrade.finalGrade === ''){
      toast.error('Please enter a final grade', {
        duration: 4000
      })
    } else {
      toast.success('Uploading...', {
        duration: 4000
      })
      const gradedRef = ref(storage, `gradedAssignments/${studentGrade.studentID + fileUpload.name.replace(/\s/g, '_') + studentGrade.assignmentID}`)
      uploadBytes(gradedRef, fileUpload)
        .then(() => {
            submitGradeToDB(e)
            showComponent()
            gradeNotification(studentGrade.studentName)
        })
    }
  }

  const regradeAssignment = (obj) => {
    const index = gradedAssignments.indexOf(obj)
    if(index > -1){
      gradedAssignments.splice(index, 1)
      freshGradedAssignments(gradedAssignments)
    }
    axios.delete(`${backend}/api/grade/delete/${obj._id}`)
      .then(res => {
        showComponent()
        removeGradedNotification(obj.studentName)
      })
  }

  if(gradedAssignment.length === 1){
    return (
      <div className="new-user">
        <div className="new-user-form">
          <div className="welcome" style={{marginBottom: -15}}>
            Assignment already graded!
          </div>
          <div className="welcome" style={{fontSize: 18}}>
            Do you wish to regrade {gradedAssignment[0].studentName}'s assignment?
          </div>
          <div className="selection-buttons">
            <button className="yes-button" onClick={() => regradeAssignment(gradedAssignment[0])}>YES</button>
            <button className="no-button" onClick={showComponent}>NO</button>
          </div>
        </div>
      </div>
    )
  }


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
            <div className="welcome">
                <form onSubmit={gradeAssignment} className="form">
                    <label className='file-advisor'>Need to upload multiple files? Zip all of your files together! <br/> (File size limit: 100MB)</label>
                    {
                        fileUpload === null || fileUpload === undefined ?
                        <label htmlFor='file-upload' className='custom-file-upload' style={{fontSize: 16, width: 'max-content'}}>
                            <SlNotebook style={{marginRight: 10}}/> Upload Graded Assignment
                        </label>
                        :
                        <label htmlFor='file-upload' className='custom-file-upload uploaded' style={{fontSize: 16}}>
                            <SlNotebook size={25} style={{marginRight: 10}}/> {fileUpload.name}
                        </label>
                    }
                    <input onChange={changeFileName} id='file-upload' className='file-upload' type="file" name='gradedAssignmentName'/>
                    <label className="due-date" style={{textAlign: 'left', marginBottom: 15}}>Student: {studentAssignment.studentName}</label>
                    <label className='due-date' style={{textAlign: 'left'}}>Final Remarks:</label>
                    <textarea onChange={changeHandler} style={{width: 502, margin: '15px auto 30px'}} name="comments" className='assignment-description'/>
                    <label className='due-date' style={{textAlign: 'left'}}>Final Grade</label>
                    <input onChange={changeHandler} type="number" name='finalGrade' className='form-inputs' min={0} max={100} />
                    {
                        fileUpload && (fileUpload.size/fileSizeLimit) > 1000 ?
                        <div className="too-large">FILE EXCEEDS SIZE LIMIT (100MB) </div>
                        : <button className='form-button'>GRADE ASSIGNMENT</button>
                    }
                </form>
            </div>
            <div className="cancel" style={{marginTop: 15, cursor: 'pointer'}} onClick={showComponent}>
                Close
            </div>
        </div>
        
    </div>
  )
}

export default Grading