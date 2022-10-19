import React, {useState} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const NewUser = (props) => {
  const {toggleNewUser, user, createdUser} = props
  const newUserEndpoint = 'http://localhost:8000/api/user/newUser'
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    userID: user.sub,
    position: ''
  })
  const [errors, setErrors] = useState('')

  const navigate = useNavigate()

  const newUserChangeHandler = (e) => {
    setNewUser({
        ...newUser,
        [e.target.name]: e.target.value
    })
  }

  const submitForm = (e) => {
    e.preventDefault()
    axios.post(newUserEndpoint, newUser)
        .then(res => {
            createdUser(res.data)
            navigate('/')
            toggleNewUser()
        })
        .catch(err => setErrors(err.response.data.errors))
  }

  return (
    <div className='new-user'>
        <div className="new-user-form">
            <div className="welcome">Welcome!</div>
            <form className='form' onSubmit={submitForm}>
                {errors.firstName ? <label className='errors'>{errors.firstName.message}</label> : null}
                <input className='form-inputs' name='firstName' type="text" placeholder='First Name' onChange={newUserChangeHandler}/>
                {errors.lastName ? <label className='errors'>{errors.lastName.message}</label> : null}
                <input className='form-inputs' name='lastName' type="text" placeholder='Last Name' onChange={newUserChangeHandler}/>
                <input className='form-inputs' type="text" readOnly value={user.sub} />
                {errors.position ? <label className='errors'>{errors.position.message}</label> : null}
                <div className="save-box card-condition">
                    <label className="option_item">
                        <input type="radio" name="position" className="checkbox" value="Teacher" onChange={newUserChangeHandler}/>
                            <div className="option_inner nm-m">
                                <div className="tickmark"></div>
                                <div className="name">Teacher</div>
                            </div>
                    </label>
                    <label className="option_item">
                        <input type="radio" name="position" className="checkbox" value="Student" onChange={newUserChangeHandler}/>
                            <div className="option_inner nm-m">
                                <div className="tickmark"></div>
                                <div className="name">Student</div>
                            </div>
                    </label>
                </div>
                <button className='form-button'>CREATE NEW USER</button>
            </form>
            <div className="cancel" style={{marginTop: 15, cursor: 'pointer'}} onClick={toggleNewUser}>
              Close
            </div>
        </div>
    </div>
  )
}

export default NewUser