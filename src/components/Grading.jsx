import React, {useState, useEffect} from 'react'
import { Toaster } from 'react-hot-toast'
import { SlNotebook } from 'react-icons/sl'
import './components.css'

const Grading = (props) => {
  const {dbUser, studentAssignment, studentID, showComponent} = props
  const [fileUpload, setFileUpload] = useState(null)
  const fileSizeLimit = 1000000

  useEffect(() => {
    console.table(studentID)
    console.table(studentAssignment)
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
            <div className="welcome">
                <form className="form">
                    <label className='file-advisor'>Need to upload multiple files? Zip all of your files together! <br/> (File size limit: 100MB)</label>
                    {
                        fileUpload === null || fileUpload === undefined ?
                        <label htmlFor='file-upload' className='custom-file-upload' style={{fontSize: 16, width: 'max-content'}}>
                            <SlNotebook style={{marginRight: 10}}/> Upload Graded Assignment
                        </label>
                        :
                        <label htmlFor='file-upload' className='custom-file-upload uploaded'>
                            <SlNotebook size={25} style={{marginRight: 10}}/> {fileUpload.name}
                        </label>
                    }
                    <input id='file-upload' className='file-upload' type="file" name='name'/>
                    <label className="due-date" style={{textAlign: 'left', marginBottom: 15}}>Student: {studentAssignment.studentName}</label>
                    <label className='due-date' style={{textAlign: 'left'}}>Final Remarks:</label>
                    <textarea style={{width: 502, margin: '15px auto 30px'}} name="description" className='assignment-description'/>
                    <label className='due-date' style={{textAlign: 'left'}}>Final Grade</label>
                    <input type="number" className='form-inputs' min={0} max={100} />
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