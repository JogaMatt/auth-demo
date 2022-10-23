import axios from 'axios'
import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import {storage} from '../firebase';
import {getDownloadURL, listAll, ref, deleteObject} from 'firebase/storage'

const Resubmit = (props) => {
  // PROPS
  const {closeResubmit, assignmentsFromDB, studentID, assignment_id, submittedAssignments, classID, assignment_name, freshSubmittedFromFB, removedSubmissionNotification} = props

  // STATES
  const [mySubmission, setMySubmission] = useState('')
  const [myAssignmentFB, setMyAssignmentFB] = useState()

  // useEFFECT
  useEffect(() => {
    setMySubmission(assignmentsFromDB.submitted.filter(assignment => assignment.studentID === studentID)[0])
    setMyAssignmentFB(submittedAssignments.filter(assignment => assignment.includes(`submittedAssignments/${assignment_id + studentID + classID + assignment_name}`)))
  }, [])

  // CONSTANTS
  const backend = 'http://localhost:8000'
  const navigate = useNavigate()

  // METHODS
  const removeMySubmission = () => {
    const newArr = [...new Set(myAssignmentFB)]
    const deleteRef = ref(storage, newArr[0])
        deleteObject(deleteRef)
            .then(res => {
                const index = assignmentsFromDB.submitted.indexOf(mySubmission)
                if(index > -1){
                    assignmentsFromDB.submitted.splice(index, 1)
                }
                axios.put(`${backend}/api/assignment/updateAssignment/${assignment_id}`, assignmentsFromDB.submitted)
                    .then(res => {
                        closeResubmit()
                        navigate('/profile')
                        removedSubmissionNotification()
                        // const newSubFromFB = [...new Set(submittedAssignments)]
                        // const newIndex = newSubFromFB.indexOf(`submittedAssignments/${assignment_id + studentID + classID + assignment_name}`)
                        // if(newIndex > -1){
                        //     freshSubmittedFromFB(newIndex, 1)
                        // }
                    })
                    .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
    


    
  }




  return (
    <div className='new-user'>
        <div className="new-user-form">
            <div className="welcome" style={{marginBottom: -15}}>
                Assignment already submitted!
            </div>
            <div className="welcome" style={{fontSize: 16}}>
                Do you wish to resubmit your assignment?
            </div>
            <div className="selection-buttons">
                <button className="yes-button" onClick={removeMySubmission}>
                    YES
                </button>
                <button className="no-button" onClick={closeResubmit}>
                    NO
                </button>
            </div>
        </div>
    </div>
  )
}

export default Resubmit