import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { SlNotebook } from 'react-icons/sl'
import {storage} from '../firebase';
import {getDownloadURL, listAll, ref} from 'firebase/storage'

const Class = (props) => {

  const [classAssignments, setClassAssignments] = useState([])
  const [students, setStudents] = useState([])
  const [currentClass, setCurrentClass] = useState('')
  const {myUser} = props
  const {classID} = useParams()
  const [submittedAssignments, setSubmittedAssignments] = useState([])
  const submittedAssignmentsRef = ref(storage, "submittedAssignments/")
  const backend = 'http://localhost:8000'
  const allAssignmentsAPI = `${backend}/api/assignment/getAssignments`
  const classesAPI = `${backend}/api/class/allClasses`
  const userID = myUser.sub.slice(myUser.sub.length - 10)




  useEffect(() => {
    axios.get(allAssignmentsAPI)
        .then(res => setClassAssignments(res.data.filter(assignment => assignment.classID === classID)))
        .catch(err => console.log(err))
    axios.get(classesAPI)
        .then(res => setCurrentClass(res.data.filter(thisClass => thisClass.classID === classID)))
        .catch(err => console.log(err))
    
    
  }, [])
  return (
    <div className="profile-page">
        <div className="profile-content">
            <div className="profile-header">
                {
                    currentClass ?
                    <>
                        <h2 style={{textAlign: 'center'}}>{currentClass[0].className}</h2>
                        <h5 style={{textAlign: 'center'}}>Class ID: {classID}</h5>
                    </>
                    : null
                }
            </div>
            <ul className='tabs'>
                <li className="tab-contents">
                    <div className="tab-title">Assignments</div>
                    <div className="sub-contents">
                        {
                            classAssignments ?
                            classAssignments.map((assignment, i) => {
                            return <Link to={`/assignment/${assignment.classID}/${assignment._id}/${assignment.name}`} key={i}>
                                <div className='create-button'>
                                <SlNotebook size={50} style={{marginTop: 30, marginBottom: 15}}/>
                                <div className='button-desc'>
                                    {assignment.name}
                                </div>
                                {
                                    submittedAssignments ?
                                    submittedAssignments.includes(`submittedAssignments/${assignment._id + userID + assignment.classID + assignment.name}`) ? <div className="button-desc">*COMPLETE*</div> : null : null
                                }
                                </div>
                            </Link>
                            })
                            : 
                            <div className='all-clear'>
                                <SlNotebook size={50} style={{marginTop: 30, marginBottom: 15}}/>
                                <h4>There are no assignments!</h4>
                            </div>
                        }
                    </div>
                </li>
            </ul>
            
        </div>
    </div>
  )
}

export default Class