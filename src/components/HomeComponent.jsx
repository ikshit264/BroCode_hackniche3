import { useEffect, useState } from "react";
import CategoryComponent from "./CategoryComponent";
import ScrollShowbarComponent from "./ScrollShowbarComponent";
import { Link } from "react-router-dom";
import dummyPic from "../assets/pg1.jpg";

export default function HomeComponent(props) {
  const PRECISION = 10 ** 18;
  const [stats, setStats] = useState({
    projects: 0,
    fundings: 0,
    contributors: 0,
  });
  const [featuredRcmd, setFeaturedRcmd] = useState([]);
  const [recentUploads, setRecentUploads] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  
  const MAX_TITLE_LENGTH = 35;
  const MAX_DESC_LENGTH = 180;
  const MAX_AUTHOR_LENGTH = 40;
  
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  };
  
  const getAllProjects = async () => {
    try {
      let res = await props.contract.getAllProjectsDetail().then((res) => {
        let tmp = [];
        let amount = 0,
          contrib = 0;
        for (const index in res) {
          let {
            amountRaised,
            cid,
            creatorName,
            fundingGoal,
            projectDescription,
            projectName,
            totalContributors,
          } = { ...res[index] };
          
          projectName = truncateText(projectName, MAX_TITLE_LENGTH);
          projectDescription = truncateText(projectDescription, MAX_DESC_LENGTH);
          creatorName = truncateText(creatorName, MAX_AUTHOR_LENGTH);
          
          tmp.push({
            amountRaised,
            cid,
            creatorName,
            fundingGoal,
            projectDescription,
            projectName,
            totalContributors,
            index,
            imageUrl: cid ? `https://${cid}` : dummyPic
          });
          amount += Number(amountRaised / PRECISION);
          contrib += Number(totalContributors);
        }
        setStats({
          projects: tmp.length,
          fundings: amount,
          contributors: contrib,
        });
        return tmp;
      });
      res.sort((a, b) => b.totalContributors - a.totalContributors);
      setFeaturedRcmd(res.slice(0, 4));
      setRecentUploads(res.slice(4, 24));
    } catch (err) {
      alert(err);
      console.log(err);
    }
  };

  const renderRecommendations = (val) => {
    return val.map((project, index) => (
      <div className="recommendationCard" key={index}>
        <Link to="/project" state={{ index: project.index }}>
          <div
            className="rcmdCardImg"
            style={{
              backgroundImage: `url(${project.imageUrl})`,
              width: "100%",
              height: "120px",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          ></div>
        </Link>
        <div className="rcmdCardDetails">
          <div className="rcmdCardHeading" style={{ minHeight: "40px" }}>
            <Link to="/project" state={{ index: project.index }}>
              {project.projectName}
            </Link>
          </div>
          <div className="rcmdCardFundedPercentage">
            {((project.amountRaised / project.fundingGoal) * 100).toFixed(2) + "% Funded"}
          </div>
          <div className="rcmdCardAuthor">{"By " + project.creatorName}</div>
        </div>
      </div>
    ));
  };

  const handleNext = () => {
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === featuredRcmd.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevious = () => {
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === 0 ? featuredRcmd.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    getAllProjects();
  }, []);

  return (
    <>
      <div className="siteStats">
        <div className="tagLine">
          Creative work shows us what's possible.
          <br></br>
          Help fund it here.
        </div>
        <div className="smallHeading">TILL THIS DAY</div>
        <div className="stats">
          <div className="statItem">
            <div className="statItemValue">{stats.projects}</div>
            <div className="statItemTag">projects </div>
          </div>
          <div className="statItem">
            <div className="statItemValue">{stats.fundings + " AVAX"}</div>
            <div className="statItemTag">towards creative work</div>
          </div>
          <div className="statItem">
            <div className="statItemValue">{stats.contributors}</div>
            <div className="statItemTag">backings</div>
          </div>
        </div>
      </div>

      {featuredRcmd.length !== 0 ? (
        <div className="suggestions">
          <div className="suggLeftContainer">
            <div className="featuredCard">
              <div className="featuredHeading">FEATURED PROJECT</div>
              <div className="featuredNavigation">
                <button className="navButton prevButton" onClick={handlePrevious}>&lt; Prev</button>
                <span className="pageIndicator">{currentFeaturedIndex + 1}/{featuredRcmd.length}</span>
                <button className="navButton nextButton" onClick={handleNext}>Next &gt;</button>
              </div>
              <Link to="/project" state={{ index: featuredRcmd[currentFeaturedIndex]?.index }}>
                <div
                  className="featuredCardProjectImg"
                  style={{
                    backgroundImage: `url(${featuredRcmd[currentFeaturedIndex]?.imageUrl})`,
                    height: "240px",
                    backgroundSize: "cover",
                    backgroundPosition: "center"
                  }}
                ></div>
              </Link>
              <div className="featuredProjectHeading" style={{ minHeight: "30px" }}>
                <Link to="/project" state={{ index: featuredRcmd[currentFeaturedIndex]?.index }}>
                  {featuredRcmd[currentFeaturedIndex]?.projectName}
                </Link>
              </div>
              <div className="featuredProjectDescription" style={{ minHeight: "80px" }}>
                {featuredRcmd[currentFeaturedIndex]?.projectDescription}
              </div>
              <div className="featuredProjectAuthor">{"By " + featuredRcmd[currentFeaturedIndex]?.creatorName}</div>
            </div>
          </div>
          <div className="suggRightContainer">
            <div className="recommendationList">
              <div className="recommendationHeading">RECOMMENDED FOR YOU</div>
              {renderRecommendations(featuredRcmd.filter((_, index) => index !== currentFeaturedIndex).slice(0, 3))}
            </div>
          </div>
        </div>
      ) : (
        <div className="noProjects">No projects found</div>
      )}
    </>
  );
}
