import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        gap: 'var(--spacing-xl)',
        flexWrap: 'wrap'
      }}>
        <div className="footer-section" style={{ flex: '1', minWidth: '200px' }}>
          <h3>ADEI</h3>
          <p>
            Association des Étudiants Ingénieurs de l'ENSAF. 
            Nous favorisons l'esprit communautaire et le développement 
            de nos étudiants à travers des activités enrichissantes.
          </p>
        </div>
        
        
        <div className="footer-section" style={{ flex: '1', minWidth: '200px' }}>
          <h4>Contact</h4>
          <p>📧 contact@adei.org</p>
          <p>📞 +212 600 000 000</p>
          <p>📍 ENSA Fès, Maroc</p>
          <p>🌐 Université Sidi Mohamed Ben Abdellah</p>
        </div>
        
        <div className="footer-section" style={{ flex: '1', minWidth: '200px' }}>
          <h4>Communauté</h4>
          <p>Rejoignez-nous pour vivre une expérience étudiante inoubliable et construire votre réseau professionnel.</p>
          <div style={{ marginTop: 'var(--spacing-sm)' }}>
            <a href="#" style={{ marginRight: 'var(--spacing-md)' }}>Facebook</a>
            <a href="#" style={{ marginRight: 'var(--spacing-md)' }}>Instagram</a>
            <a href="#" style={{ marginRight: 'var(--spacing-md)' }}>LinkedIn</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {year} ADEI - Association des Étudiants Ingénieurs. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;