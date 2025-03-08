import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function FooterComponent(props) {
  return (
    <div className="footer">
      <div className="footerContainer">
        <div className="trademarkSection">Decentra-X Fnd © 2024</div>
        <div className="externalLinks">
          <div className="linkWrapper">
            <div className="icon">
              <a
                href="https://x.com/AnishSingh9454"
                className="twitter-icon"
                target="_blank"
                rel="noreferrer"
              >
                <FaTwitter />
              </a>
            </div>
            <div className="icon">
              <a
                href="https://github.com/anishsingh90"
                className="github-icon"
                target="_blank"
                rel="noreferrer"
              >
                <FaGithub />
              </a>
            </div>
            <div className="icon">
            <div className="linkedin-icon-bg">
             <a
               href="https://www.linkedin.com/in/anish90/"
               className="linkedin-icon"
               target="_blank"
               rel="noreferrer"
             >
               <FaLinkedin />
  </a>
</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
