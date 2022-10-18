import React, {useState, useEffect} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const NewClass = (props) => {
  const {currentUser, createClass, allClasses} = props
  const newClassEndpoint = 'http://localhost:8000/api/class/newClass'
  const [genCode, setGenCode] = useState('')
  const [newClass, setNewClass] = useState({
    teacher: `${currentUser.userID.slice(currentUser.userID.length - 10)}`,
    students: '',
    subject: '',
    className: '',
    classID: '',
    schoolName: ''
  })
  const [errors, setErrors] = useState('')
  const navigate = useNavigate()

  const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  const abc = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'o', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

  const genClassID = (arr, arr2) => {
    let teamArr = []
    for(let i = 0; i < 8; i++){
      let pair = `${arr2[(Math.floor(Math.random() * (26)))]}${arr[(Math.floor(Math.random() * (10)))]}`
      teamArr.push(pair)
    }
    const teamCode = teamArr.join('')
    setNewClass({
        ...newClass,
        classID: teamCode
    })
  }

  useEffect(() => {
    genClassID(nums, abc)
  }, [])

  const newClassChangeHandler = (e) => {
    setNewClass({
        ...newClass,
        [e.target.name]: e.target.value
    })
  }

  const submitForm = (e) => {
    e.preventDefault()
    axios.post(newClassEndpoint, newClass)
        .then(res => {
            navigate('/profile')
            createClass()
            allClasses(res.data)
        })
        .catch(err => setErrors(err.response.data.errors))
  }

  

  return (
    <div className='new-user'>
        <div className="new-user-form">
            <div className="welcome">New Class!</div>
            <form className='form' onSubmit={submitForm}>
                <input className='form-inputs' name='teacherID' type="text" value={`Teacher ID: ${currentUser.userID}`} readOnly/>
                {errors.subject ? <label className='errors'>{errors.subject.message}</label> : null}
                <input className='form-inputs' name='subject' type="text" placeholder='Subject' onChange={newClassChangeHandler}/>
                {errors.className ? <label className='errors'>{errors.className.message}</label> : null}
                <input className='form-inputs' name='className' type="text" placeholder='Class Name' onChange={newClassChangeHandler}/>
                {errors.schoolName ? <label className='errors'>{errors.schoolName.message}</label> : null}
                <input className='form-inputs' name='schoolName' type="text" placeholder='School Name' onChange={newClassChangeHandler}/>
                <input className='form-inputs' name='classID' type="text" value={`Class ID: ${newClass.classID}`} readOnly/>
                <button className='form-button'>CREATE NEW CLASS</button>
            </form>
        </div>
    </div>
  )
}

export default NewClass