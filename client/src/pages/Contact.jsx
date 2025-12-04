import React from 'react';

const Contact = () => {
    return (
        <main className="contact-container">
            <section className="contact-hero">
                <h1 className="contact-hero-title">Contact</h1>
            </section>

            <section className="contact">
                <div>
                    <h4>Contact us</h4>
                    <h2>We Are Director's Letters</h2>
                    <img src="/images/maleconductor.jpg" alt="Conductor" />
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
                            <input type="text" id="name" placeholder="Name" />
                            <label htmlFor="subject"></label>
                            <input type="text" id="subject" placeholder="Subject" />
                        </div>
                        <div className="email">
                            <label htmlFor="email"></label>
                            <input type="text" id="email" placeholder="Email" />
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
                                <a href="https://www.facebook.com/">
                                    <img src="/images/facebook.png" alt="Facebook" />
                                </a>
                            </li>
                            <li>
                                <a href="https://twitter.com/?lang=en">
                                    <img src="/images/twitter.png" alt="Twitter" />
                                </a>
                            </li>
                            <li>
                                <a href="https://www.instagram.com/">
                                    <img src="/images/instagram.png" alt="Instagram" />
                                </a>
                            </li>
                            <li>
                                <a href="https://www.linkedin.com/">
                                    <img src="" alt="" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Contact;
