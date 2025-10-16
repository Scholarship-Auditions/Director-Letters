import React from 'react';
import { Link } from 'react-router-dom';
import directorsLogo from '../assets/directors-logo.png';

function Home() {
  return (
    <main className="home-container">
      <section className="home-hero">
        <h2>
          Streamlined Letters
          <br />
          For Music Educators
          <br />
          By Music Educators
          <br />
        </h2>
        <h5>
          At DirectorLetters.com, our mission is to empower music educators by relieving communication overload. With
          hundreds of templates for band, choir, orchesta, and musical theater directors, we give back precious time
          to inspire, create, and make music.
        </h5>
      </section>

      <section className="home-letters">
        <Link to="/letters/director/Band Director">
          <div className="letter-one">
            <h5>Band Director Letters</h5>
          </div>
        </Link>
        <Link to="/letters/director/Choir Director">
          <div className="letter-two">
            <h5>Choir Director Letters</h5>
          </div>
        </Link>
        <Link to="/letters/director/Orchestra Director">
          <div className="letter-three">
            <h5>Orchestra Director Letters</h5>
          </div>
        </Link>
        <Link to="/letters/director/Musical Theater Director">
          <div className="letter-four">
            <h5>Musical Theater Director Letters</h5>
          </div>
        </Link>
      </section>

      <section className="about">
        <div className="about-logo">
          <img src={directorsLogo} alt="Directors-logo" />
        </div>
        <div className="about-section">
          <h3 className="about-title">About</h3>
          <h6 className="about-body">
            Welcome to DirectorLetters.com, where we truly understand the multifaceted challenges of being a modern
            music educator. We wholeheartedly recognize that effective communication forms the very foundation of your
            success in this pivotal role. As a dedicated music educator, you bear the responsibility of maintaining
            open lines of communication with various stakeholders, most notably your school's administration,
            including your principal. Equally vital is the task of keeping parents well-informed about their
            children's progress and actively engaging their invaluable support. However, let's not overlook the
            constant demand for communication with your students themselves. While the ultimate goal is to create music
            together, the limited classroom time available for instruction can often be eroded by the sheer volume of
            information that must be shared collectively and individually. Consequently, you may find yourself
            continuously resorting to email as a means to provide your students with the essential details that will
            keep them connected and your music program flourishing with resounding success... <br />
          </h6>
          <div className="about-button">
            <Link to="/about">
              <button className="btn">More</button>
            </Link>
          </div>
        </div>
      </section>

      <section className="home-sites">
        <div id="site">
          <a href="https://www.accoladi.com/public" target="_blank" rel="noopener noreferrer">
            <div className="web-one"></div>
            <h5>Accoladi</h5>
          </a>
        </div>
        <div id="site">
          <a href="https://www.nationalscholasticmusiciansawards.com/home" target="_blank" rel="noopener noreferrer">
            <div className="web-two"></div>
            <h5>National Scholastic Musician Awards</h5>
          </a>
        </div>
        <div id="site">
          <a href="https://www.mymusicfuture.com/" target="_blank" rel="noopener noreferrer">
            <div className="web-three"></div>
            <h5>My Music Future</h5>
          </a>
        </div>
      </section>

      <section className="connect">
        <div>
          <h4>Let's Connect</h4>
          <h2>
            We're A Team Of Music Educators
            <br />
            Who Are Excited About Music Education
          </h2>
        </div>
.        <div className="connect-button">
          <Link to="/contact">
            <button className="btn">Connect</button>
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;