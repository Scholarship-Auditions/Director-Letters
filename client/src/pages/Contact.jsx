import React from 'react';
import maleConductor from '../assets/maleconductor.jpg';
import facebookIcon from '../assets/facebook.png';
import twitterIcon from '../assets/twitter.png';
import instagramIcon from '../assets/instagram.png';
// Note: linkedin icon was missing in the original files, so it's omitted here.

function Contact() {
  return (
    <main className="contact-container">
      <section className="contact-hero">
        <h1 className="contact-hero-title">Contact</h1>
      </section>

      <section className="contact">
        <div>
          <h4>Contact us</h4>
          <h2>We Are Director's Letters</h2>
          <img src={maleConductor} alt="Male conductor" />
        </div>
        <div className="contact-form">
          <div className="form-header">
            <h3>Feel free to contact us</h3>
            <h5>Have comments, questions, feedback or share?</h5>
            <h5>Our team woulds love to here from you</h5>
          </div>

          <div className="form">
            <div className="contact-row">
              <label htmlFor="name"></label>
              <input type="text" placeholder="Name" id="name" />
              <label htmlFor="subject"></label>
              <input type="text" placeholder="Subject" id="subject" />
            </div>
            <div className="email">
              <label htmlFor="email"></label>
              <input type="text" placeholder="Email" id="email" />
            </div>
            <div className="msg">
              <label htmlFor="msg"></label>
              <textarea name="msg" id="msg" cols="43" rows="6" placeholder="Message"></textarea>
            </div>
          </div>
        </div>
      </section>

      <section className="more-info">
        <div>
          <h4>Office Info</h4>
          <h5>Phone: +1 310-310-6000</h5>
          <h5>Mail: example@kethstudio.com</h5>
        </div>
        <div>
          <div>
            <h5>Our Social Links</h5>
            <h4>Follow our social media account for up to date.</h4>
          </div>
          <div className="sm-icons">
            <ul className="social-media-icons">
              <li>
                <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
                  <img src={facebookIcon} alt="Facebook" />
                </a>
              </li>
              <li>
                <a href="https://twitter.com/?lang=en" target="_blank" rel="noopener noreferrer">
                  <img src={twitterIcon} alt="Twitter" />
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                  <img src={instagramIcon} alt="Instagram" />
                </a>
              </li>
              <li>
                <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer">
                  {/* LinkedIn icon was missing */}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;