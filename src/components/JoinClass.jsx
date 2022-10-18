import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const JoinClass = (props) => {
  const {currentUser, joinCurrentClass, allStudentClasses, studentClasses} = props
  const [classCode, setClassCode] = useState('')
  const [potentialStudent, setPotentialStudent] = useState({
    name: `${currentUser.firstName} ${currentUser.lastName}`,
    studentID: currentUser.userID.slice(currentUser.userID.length - 10)
  })
  const [errors, setErrors] = useState('')
  const [potentialClasses, setPotentialClasses] = useState([])
  const navigate = useNavigate()
  const addStudentAPI = 'http://localhost:8000/api/class/addStudent/'
  const allClassesAPI = 'http://localhost:8000/api/class/allClasses'
  const myClasses = studentClasses.map(classroom => classroom.classID)

  useEffect(() => {
    console.log(myClasses)
    axios.get(allClassesAPI)
      .then(res => setPotentialClasses(res.data.map(newClassCode => newClassCode.classID)))
      .catch(err => console.log(err))
  }, [])

  const submitForm = (e) => {
    e.preventDefault()
    if(classCode === ''){
      setErrors('Please enter a Class ID')
    } else if(!potentialClasses.includes(classCode)){
      setErrors('Please enter a valid Class ID')
    } else if(myClasses.includes(classCode)){
      setErrors('You are already a student in this class!')
    } else {
      axios.put(addStudentAPI + classCode, potentialStudent)
          .then(res => {
              navigate('/profile')
              joinCurrentClass()
              allStudentClasses(res.data)
          })
          .catch(err => console.log(err))
    }
  }

  return (
    <div className='new-user'>
        <div className="new-user-form">
            <div className="welcome">Join a Class!</div>
            <form className='form' onSubmit={submitForm}>
                <input type="text" value={`${currentUser.firstName} ${currentUser.lastName}`} className="form-inputs" readOnly/>
                <input className='form-inputs' name='teacherID' type="text" value={`Student ID: ${currentUser.userID}`} readOnly/>
                {errors ? <label className='errors'>{errors}</label> : null}
                <input className='form-inputs' name='classID' type="text" placeholder='Class ID' onChange={(e) => setClassCode(e.target.value)}/>
                <button className='form-button'>JOIN CLASS</button>
            </form>
        </div>
    </div>
  )
}

export default JoinClass