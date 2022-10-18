import React from 'react'
import {BsLinkedin, BsGithub} from 'react-icons/bs'

const Footer = () => {
  return (
    <div className='footer'>
        <div className="footer-copyright">
            © 2022 All Rights Reserved - Matthew Joga
        </div>
        <div className="socials">
            <a href="https://www.linkedin.com/in/matt-joga-766a03141/"><BsLinkedin size={20}/></a>
            <a href="https://www.github.com/JogaMatt"><BsGithub size={20}/></a>
        </div>
    </div>
  )
}

export default Footer