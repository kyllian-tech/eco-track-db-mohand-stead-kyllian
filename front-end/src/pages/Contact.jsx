function Contact() {
  return (
    <div className="public-page">
      <h1>Contact</h1>

      <p className="public-intro">
        Une question, une demande de partenariat ou une démonstration ? Contactez
        l’équipe ECOTRACK.
      </p>

      <div className="contact-layout">
        <form className="contact-form">
          <div className="form-group">
            <label>Nom</label>
            <input type="text" placeholder="Votre nom" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="votre@email.com" />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea placeholder="Votre message..." rows="6"></textarea>
          </div>

          <button type="button" className="primary-btn">
            Envoyer
          </button>
        </form>

        <div className="contact-info">
          <h3>ECOTRACK</h3>
          <p>Email : contact@ecotrack.com</p>
          <p>Téléphone : +33 1 23 45 67 89</p>
          <p>Adresse : Paris, France</p>

          <div className="social-box">
            <h4>Suivez-nous</h4>
            <a href="#">LinkedIn</a>
            <a href="#">Twitter</a>
            <a href="#">Facebook</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;