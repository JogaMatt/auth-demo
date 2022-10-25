import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

const MyGrades = (props) => {
  const {myAssignments, myClasses} = props
  const {userID} = useParams()
  const [onlyMine, setOnlyMine] = useState([])
  const [myGradesFromDB, setMyGradesFromDB] = useState([])

  const backend = 'http://localhost:8000'
  const myGradesAPI = `${backend}/api/grade/myGrades/${userID}`
  const assignmentsAPI = `${backend}/api/assignment/getAssignments`
  const allClassesAPI = `${backend}/api/class/allClasses`
  
  

  useEffect(() => {
    axios.get(myGradesAPI)
        .then(res => {
            setMyGradesFromDB(res.data.filter(grade => grade.studentID === userID))
        })
        .catch(err => console.log(err))
    setOnlyMine(myAssignments.filter(potentialAssignment => myClasses.some(s => s.classID === potentialAssignment.classID)))
  }, [])

  return (
    <div className="profile-page">
        <div className="profile-content">
            <div className='bottom-assignment-table'>
                {
                    myClasses && onlyMine ?
                    <>
                        <div className="tab-title" style={{width: 'max-content'}}>My Grades</div>
                        <table className='assignment-table'>
                            <thead className='assignment-table-head'>
                                <tr className='assignment-table-title-row'>
                                    <th className='assignment-tab-title'>Assignment Name</th>
                                    <th className='assignment-tab-title'>Due Date</th>
                                    <th className='assignment-tab-title'>Grade</th>
                                    <th className="assignment-tab-title">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    onlyMine.map((assignment, i) => {
                                        return <tr className='assignment-table-title-row' key={i}>
                                            <td>{assignment.name}</td>
                                            <td>{assignment.dueDate}</td>
                                            {
                                                myGradesFromDB ?
                                                myGradesFromDB.filter(grade => grade.assignmentName === assignment.name)[0] ?
                                                <>
                                                    <td>{myGradesFromDB.filter(grade => grade.assignmentName === assignment.name)[0].finalGrade}</td>
                                                    <td>{myGradesFromDB.filter(grade => grade.assignmentName === assignment.name)[0].comments}</td>
                                                </>
                                                : <><td>---</td><td>---</td></> : null
                                            }
                                        </tr>
                                    })
                                }
                            </tbody>
                        </table>
                    </>
                    : null
                }
            </div>
        </div>
    </div>
        
  )
}

export default MyGrades