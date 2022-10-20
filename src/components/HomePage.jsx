import React, { useState, useEffect } from 'react'
import { SlNotebook } from 'react-icons/sl'
import {MdOutlineGrade} from 'react-icons/md'
import {SiGoogleclassroom} from 'react-icons/si'
import { Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import NewUser from './NewUser'
import axios from 'axios'

const HomePage = (props) => {
  const {updateAppUser, currentUser, user} = props
  const [newUser, showNewUser] = useState(false)
  const oneUserAPI = `http://localhost:8000/api/user/oneUser/${user.sub}`

  const toggleNewUser = () => {
    showNewUser(!newUser)
  }

  useEffect(() => {
    axios.get(oneUserAPI)
        .then(res => updateAppUser(res.data[0]))
        .catch(err => console.log(err))
  }, [oneUserAPI])

  return (
    <div className='homepage'>
      <div className="hero-banner-one">
        <div className="hero-banner-one-info">
          <div className="hero-title">
            Connecting Teachers and Students <br/> Just Got Easier!
          </div>
          <div className="hero-desc">
            Being prepared and organized is essential. <br/> We're here to help facilitate the school-going experience
          </div>
          { currentUser ?
            <Link to='/my-assignments'><button className='navigate-button'>ASSIGNMENTS<SlNotebook size={20} style={{marginLeft: 5}}/></button></Link>
            : null
          }
        </div>
      </div>
      <div className="homepage-desc-one">
        <div className="hero-title-two">
          <h2>The Ultimate One-Stop-Shop</h2>
        </div>
        <div className="site-buttons">
          <ul className='site-cards'>
              <li className='card'>
                <SiGoogleclassroom size={50} style={{marginBottom: 15}}/>
                <div className="card-title" style={{marginBottom: 15}}>Classes</div>
                <div className="card-desc">
                  Teachers can make classes for students to join. Students can view all of their classes.
                </div>
              </li>
              <li className='card'>
                <MdOutlineGrade size={50} style={{marginBottom: 15}}/>
                <div className="card-title" style={{marginBottom: 15}}>Grades</div>
                <div className="card-desc">
                  Check your grades at one central location. Teachers, let's make it easy for you!
                </div>
              </li>
              <li className='card'>
                <SlNotebook size={50} style={{marginBottom: 15}}/>
                <div className="card-title" style={{marginBottom: 15}}>Assignments</div>
                <div className="card-desc">
                  Upload and download all of your assignments! Missed school or lost your paper? We've got you covered!
                </div>
              </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HomePage