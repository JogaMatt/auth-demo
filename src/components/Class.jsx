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
  const [dbUser, setDbUser] = useState('')
  const [currentClass, setCurrentClass] = useState('')
  const {myUser} = props
  const {classID} = useParams()
  const [submittedAssignments, setSubmittedAssignments] = useState([])
  const [assignmentsFromDB, setAssignmentsFromDB] = useState([])
  const submittedAssignmentsRef = ref(storage, "submittedAssignments/")
  const backend = 'http://localhost:8000'
  const allAssignmentsAPI = `${backend}/api/assignment/getAssignments`
  const classesAPI = `${backend}/api/class/allClasses`
  const userID = myUser.sub.slice(myUser.sub.length - 10)
  const currentUserAPI = `${backend}/api/user/oneUser/${myUser.sub}`
  const submittedAssignmentsFromDB = `${backend}/api/assignment/getAssignmentsForOneClass/${classID}`
  const [downloadUrls, setDownloadUrls] = useState([])



  useEffect(() => {
    axios.get(allAssignmentsAPI)
        .then(res => setClassAssignments(res.data.filter(assignment => assignment.classID === classID)))
        .catch(err => console.log(err))
    axios.get(classesAPI)
        .then(res => setCurrentClass(res.data.filter(thisClass => thisClass.classID === classID)))
        .catch(err => console.log(err))
    axios.get(currentUserAPI)
        .then(res => setDbUser(res.data))
        .catch(err => console.log(err))
    axios.get(submittedAssignmentsFromDB)
        .then(res => setAssignmentsFromDB(res.data[0].submitted))
        .catch(err => console.log(err))
    listAll(submittedAssignmentsRef).then((res) => {
        res.items.forEach((item) => {
            if(item._location.path_.includes(classID)){
                setSubmittedAssignments((prev) => [...prev, item._location.path_])
            }
            getDownloadURL(item).then((url) => {
                if(url.includes(classID)){
                    setDownloadUrls((prev) => [...prev, url])
                }
            })
        })
      })
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
            {
                dbUser ?
                dbUser[0].position === 'Teacher' ?
                <>
                    <div className="tab-title" style={{width: 'max-content'}}>Submitted Assignments</div>
                    <table className='assignment-table'>
                        <thead className='assignment-table-head'>
                            <tr className='assignment-table-title-row'>
                                <th className='assignment-tab-title'>Student ID</th>
                                <th className='assignment-tab-title'>Student Name</th>
                                <th className='assignment-tab-title'>Assignment Name</th>
                                <th className='assignment-tab-title'>Due Date</th>
                                <th className='assignment-tab-title'>Date Submitted</th>
                                <th className='assignment-tab-title'>Status</th>
                                <th className='assignment-tab-title'>Download</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                assignmentsFromDB ?
                                assignmentsFromDB.map((studentAssignment, i) => {
                                    return <tr className='assignment-table-title-row' key={i}>
                                        <td>{studentAssignment.studentID}</td>
                                        <td>{studentAssignment.studentName}</td>
                                        <td>{studentAssignment.name}</td>
                                        <td>{studentAssignment.dueDate}</td>
                                        <td>{studentAssignment.dateSubmitted}</td>
                                        {
                                            studentAssignment.dueDate > studentAssignment.dateSubmitted ?
                                            <td style={{color: '#28d928'}}>On Time</td>
                                            : <td style={{color: 'red'}}>Late</td>
                                        }
                                        {
                                            downloadUrls ?
                                            <td>
                                                <a href={downloadUrls.filter(url => url.includes(studentAssignment.studentID))} download={studentAssignment.name}>
                                                    <button className='assignment-download-button'>View</button>
                                                </a>
                                            </td>
                                            : null
                                        }
                                    </tr>
                                })
                                : null
                            }
                        </tbody>
                    </table>
                </>
                : null : null
            }
        </div>
    </div>
  )
}

export default Class