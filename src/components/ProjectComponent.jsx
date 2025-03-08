import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { FiClock, FiUsers, FiExternalLink, FiCalendar, FiTag, FiUser } from "react-icons/fi";
import PaymentModal from "./PaymentModal";
import dummyPic from "../assets/pg1.jpg";
import "./ProjectComponent.css";

function ProjectComponent(props) {
  const [modalShow, setModalShow] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    amountRaised: 0,
    cid: "",
    creatorName: "",
    fundingGoal: 0,
    projectDescription: "",
    projectName: "",
    contributors: [],
    creationTime: 0,
    duration: 0,
    projectLink: "",
    amount: [],
    creatorAddress: "",
    category: "",
  });
  const [timerString, setTimerString] = useState("");
  const [isOver, setIsOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const { index } = location.state;
  const PRECISION = 10 ** 18;

  // Calculate funding progress percentage
  const calculateProgress = () => {
    return Math.min(
      Math.round((projectDetails.amountRaised / projectDetails.fundingGoal) * 100),
      100
    );
  };

  // Format currency amounts
  const formatAmount = (amount) => {
    return (amount / PRECISION).toFixed(2);
  };

  // Fetch the project details from the smart contract
  async function getProjectDetails() {
    setIsLoading(true);
    try {
      // Fetching project information from the contract
      await props.contract.getProject(parseInt(index)).then((res) => {
        let {
          amountRaised,
          cid,
          creatorName,
          fundingGoal,
          projectDescription,
          projectName,
          contributors,
          creationTime,
          duration,
          projectLink,
          amount,
          creatorAddress,
          refundPolicy,
          category,
          refundClaimed,
          claimedAmount,
        } = { ...res };        

        let tmp = [];
        for (const index in contributors) {
          tmp.push({
            contributor: contributors[index],
            amount: amount[index],
            refundClaimed: refundClaimed[index]
          });
        }

        tmp.sort((a, b) => (b.amount - a.amount));
        
        let contributorsCopy = [];
        let amountCopy = [];
        let refundClaimedCopy = [];
        for (const index in tmp) {
          contributorsCopy.push(tmp[index].contributor);
          amountCopy.push(tmp[index].amount);
          refundClaimedCopy.push(tmp[index].refundClaimed);
        }

        setProjectDetails({
          amountRaised,
          cid,
          creatorName,
          fundingGoal,
          projectDescription,
          projectName,
          contributors: contributorsCopy,
          creationTime: creationTime * 1,
          duration,
          projectLink,
          amount: amountCopy,
          creatorAddress,
          refundPolicy,
          category,
          refundClaimed: refundClaimedCopy,
          claimedAmount,
        });
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Error fetching project details:", error);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getProjectDetails();
  }, []);

  useEffect(() => {
    getProjectDetails();
  }, [modalShow]);

  // UseEffect hook to handle the countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date().getTime() / 1000;
      const remainingTime =
        Number(projectDetails.creationTime) +
        Number(projectDetails.duration) -
        currentTime;
      const days = Math.floor(remainingTime / (60 * 60 * 24));
      const hours = Math.floor((remainingTime % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((remainingTime % (60 * 60)) / 60);
      const seconds = Math.floor(remainingTime % 60);

      setTimerString(`${days}d ${hours}h ${minutes}m ${seconds}s`);

      if (remainingTime < 0) {
        setTimerString("0d 0h 0m 0s");
        clearInterval(interval);
        // This condition is set because at initial render, creationTime and duration state are not set
        // so remaining time turns out to be negative
        if (projectDetails.creationTime > 0) {
          setIsOver(true);
        }
      }
    }, 1000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [projectDetails.creationTime, projectDetails.duration]);

  // Sets the condition true for payment modal to render 
  function onClickPayment() {
    setModalShow(true);
  }

  // Return category code
  function getCategoryFromCode(val) {
    let categoryCode = ["Design & Tech", "Film", "Arts", "Games"];
    return (val >= 0 && val < 4) ? categoryCode[val] : "Other";
  }

  // Convert epoch time format to dd/mm/yyyy format
  function displayDate(val) {
    let date = new Date(val * 1000);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  }

  // Check if user is the project owner
  function isOwner() {
    return (props.userAddress === projectDetails.creatorAddress);
  }

  // Check if claiming fund is possible for the project owner
  function claimFundCheck() {
    return (projectDetails.refundPolicy ? 
      (projectDetails.amountRaised / PRECISION) : 
      (projectDetails.amountRaised >= projectDetails.fundingGoal));
  }

  // Claim fund by calling function in the smart contract
  async function claimFund() {
    try {
      let txn = await props.contract.claimFund(parseInt(index));
      await txn.wait(txn);
      alert('Funds successfully claimed');

      setProjectDetails({
        ...projectDetails,
        claimedAmount: true
      });
    } catch(error) {
      alert('Error claiming fund: ' + error.message);
      console.error(error);
    }    
  }

  // Check if the user is a contributor to the project
  function checkIfContributor() {
    let idx = getContributorIndex();
    return (idx < 0) ? false : true;
  }

  // Get the contributor index of the user in the contributor[]
  function getContributorIndex() {
    return projectDetails.contributors.indexOf(props.userAddress);
  }

  // Check if claiming refund is possible for the user
  function claimRefundCheck() {
    return (projectDetails.refundPolicy ? 
      false : 
      (projectDetails.amountRaised < projectDetails.fundingGoal));
  }

  // Claim refund by calling the function in the smart contract
  async function claimRefund() {
    try {
      let txn = await props.contract.claimRefund(parseInt(index));
      await txn.wait(txn);
      alert('Refund claimed successfully');
      
      let refundClaimedCopy = [...projectDetails.refundClaimed];
      refundClaimedCopy[getContributorIndex()] = true;

      setProjectDetails({
        ...projectDetails,
        refundClaimed: refundClaimedCopy
      });
    } catch(error) {
      alert('Error claiming refund: ' + error.message);
      console.error(error);
    }
  }

  // Truncate address for display
  const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isLoading) {
    return (
      <div className="project-loading">
        <div className="loader"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="project-container">
      <div className="project-header">
        <h1>{projectDetails.projectName}</h1>
        <div className="project-category">
          <FiTag className="icon" />
          <span>{getCategoryFromCode(projectDetails.category)}</span>
        </div>
      </div>

      <div className="project-content">
        <div className="project-main">
          <div className="project-image-container">
            <img
              src={projectDetails.cid ? "https://" + projectDetails.cid : dummyPic}
              alt={projectDetails.projectName}
              className="project-image"
            />
          </div>

          <div className="project-description-section">
            <h2>About This Project</h2>
            <p>{projectDetails.projectDescription}</p>
            
            <div className="project-meta">
              <div className="meta-item">
                <FiExternalLink className="icon" />
                <span>Project Link: </span>
                <a href={projectDetails.projectLink} target="_blank" rel="noopener noreferrer">
                  {projectDetails.projectLink}
                </a>
              </div>
              
              <div className="meta-item">
                <FiUser className="icon" />
                <span>Creator: </span>
                <Link to="/profile" state={{ address: projectDetails.creatorAddress, name: projectDetails.creatorName }}>
                  {projectDetails.creatorName}
                </Link>
              </div>
              
              <div className="meta-item">
                <FiCalendar className="icon" />
                <span>Created on: </span>
                {displayDate(projectDetails.creationTime)}
              </div>

              <div className="meta-item">
                <span>Refund Policy: </span>
                <span className={`refund-policy ${projectDetails.refundPolicy ? 'non-refundable' : 'refundable'}`}>
                  {projectDetails.refundPolicy ? "Non-Refundable" : "Refundable"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="project-sidebar">
          <div className="funding-status">
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${calculateProgress()}%` }}></div>
              <div className="progress-text">{calculateProgress()}% funded</div>
            </div>

            <div className="funding-details">
              <div className="funding-amount">
                <h2>{formatAmount(projectDetails.amountRaised)} AVAX</h2>
                <p>pledged of {formatAmount(projectDetails.fundingGoal)} AVAX goal</p>
              </div>

              <div className="funding-stat">
                <div className="stat-value">
                  <FiUsers className="icon" />
                  <h3>{projectDetails.contributors.length}</h3>
                </div>
                <p>backers</p>
              </div>

              <div className="funding-stat">
                <div className="stat-value">
                  <FiClock className="icon" />
                  <h3>{!isOver ? timerString : "Funding Complete"}</h3>
                </div>
                {!isOver && <p>remaining</p>}
              </div>
            </div>

            {!isOver ? (
              !isOwner() && (
                <button className="support-button" onClick={() => onClickPayment()}>
                  Back this project
                </button>
              )
            ) : isOwner() ? (
              (claimFundCheck() && !projectDetails.claimedAmount) ? (
                <button className="claim-button" onClick={() => claimFund()}>
                  Claim Funds
                </button>
              ) : (
                projectDetails.claimedAmount && (
                  <div className="claimed-notice">Funds claimed</div>
                )
              )
            ) : (
              (checkIfContributor() && claimRefundCheck() && !projectDetails.refundClaimed[getContributorIndex()]) ? (
                <button className="refund-button" onClick={() => claimRefund()}>
                  Claim Refund
                </button>
              ) : (
                projectDetails.refundClaimed[getContributorIndex()] && (
                  <div className="claimed-notice">Refund Claimed</div>
                )
              )
            )}
          </div>
        </div>
      </div>

      <div className="contributors-section">
        <h2>Contributors</h2>
        {projectDetails.contributors.length > 0 ? (
          <div className="contributors-table">
            <div className="table-header">
              <div className="table-cell rank">Rank</div>
              <div className="table-cell address">Address</div>
              <div className="table-cell amount">Contribution</div>
            </div>
            <div className="table-body">
              {projectDetails.contributors.map((contributor, idx) => (
                <div className="table-row" key={idx}>
                  <div className="table-cell rank">{idx + 1}</div>
                  <div className="table-cell address">
                    <span className="full-address">{contributor}</span>
                    <span className="truncated-address">{truncateAddress(contributor)}</span>
                  </div>
                  <div className="table-cell amount">{formatAmount(projectDetails.amount[idx])} AVAX</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="no-contributors">No contributors yet</div>
        )}
      </div>

      {modalShow && (
        <PaymentModal
          setModalShow={setModalShow}
          contract={props.contract}
          index={index}
          projectDetails={projectDetails}
          setProjectDetails={setProjectDetails}
          userAddress={props.userAddress}
        />
      )}
    </div>
  );
}

export default ProjectComponent;