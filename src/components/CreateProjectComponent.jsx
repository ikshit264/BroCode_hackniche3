import { useState } from "react";
import { Web3Storage } from 'web3.storage';

function CreateProjectComponent(props) {
  const [formInput, setFormInput] = useState({
    projectName: "",
    projectCategory: "",
    projectDescription: "",
    creatorName: "",
    refundPolicy: "",
    social: "",
    fundingGoal: 0,
    duration: 1,
    projectImage: "",
    projectLink: "",
  });

  const [inputImage, setInputImage] = useState(null);

  // set the form input state if input changes
  function handleChange(e) {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value
    });
  }

  // read the input image file
  async function handleImageChange(e) {
    setInputImage(e.target.files[0]);
  }

  // submit the form input data to smart contract
  async function submitProjectData(e) {
    e.preventDefault();
    
    // Upload image to Web3.Storage if provided
    if (inputImage) {
      try {
        const client = new Web3Storage({ token: process.env.WEB3_STORAGE_API_TOKEN });
        const fileList = [new File([inputImage], inputImage.name, { type: inputImage.type })];
        
        const cid = await client.put(fileList, {
          name: "Project Image",
          maxRetries: 3,
        });
        
        formInput.projectImage = `ipfs.io/ipfs/${cid}/${inputImage.name}`;
      } catch (error) {
        alert("Error uploading image: " + error);
        console.log(error);
        return;
      }
    }

    // Convert funding goal and duration to numbers
    const fundingGoal = parseFloat(formInput.fundingGoal);
    const duration = parseFloat(formInput.duration);

    // Get category code
    const categoryCode = {
      "design": 0,
      "film": 1,
      "arts": 2,
      "games": 3,
    }[formInput.projectCategory] || 0;

    // Get refund policy code
    const refundPolicyCode = {
      "refundable": 0,
      "non-refundable": 1,
    }[formInput.refundPolicy] || 0;

    // Call contract method
    try {
      const txn = await props.contract.createNewProject(
        formInput.projectName,
        formInput.projectDescription,
        formInput.creatorName,
        formInput.projectLink,
        formInput.projectImage,
        fundingGoal,
        duration,
        categoryCode,
        refundPolicyCode
      );

      await txn.wait();
      alert("Project creation complete!");
      e.target.reset();
    } catch (error) {
      alert("Error creating project: " + error);
      console.log(error);
    }
  }

  return (
    <div className="create-project" style={{
      backgroundImage: "linear-gradient(to bottom, #3498db, #2980b9)",
      minHeight: "100vh",
      padding: "20px",
      color: "white",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1 style={{ 
        textAlign: "center", 
        fontSize: "28px", 
        marginBottom: "30px" 
      }}>Create Project</h1>

      <form onSubmit={submitProjectData} name="projectForm" style={{
        maxWidth: "800px",
        margin: "0 auto",
        position: "relative",
        zIndex: "1"
      }}>
        <div className="form-grid" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px"
        }}>
          {/* Left Column */}
          <div className="form-left">
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Project Name</label>
              <input
                type="text"
                name="projectName"
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Project Description</label>
              <input
                type="text"
                name="projectDescription"
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Refund Policy</label>
              <input
                type="text"
                name="refundPolicy"
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Funding Goal</label>
              <input
                type="number"
                name="fundingGoal"
                min="1"
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Project Image</label>
              <input
                type="file"
                name="projectImage"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="form-right">
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Project Category</label>
              <input
                type="text"
                name="projectCategory"
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Creator Name</label>
              <input
                type="text"
                name="creatorName"
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Social</label>
              <input
                type="text"
                name="social"
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Duration</label>
              <input
                type="number"
                name="duration"
                min="1"
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Project Link</label>
              <input
                type="url"
                name="projectLink"
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>
          </div>
        </div>

        <div className="submit-container" style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            type="submit"
            style={{
              backgroundColor: "#2980b9",
              color: "white",
              padding: "10px 30px",
              borderRadius: "20px",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
            }}
          >
            Submit
          </button>
        </div>
      </form>

      {/* Background images */}
      <div className="background-images" style={{
        position: "absolute",
        bottom: "0",
        left: "0",
        width: "100%",
        pointerEvents: "none",
        zIndex: "0"
      }}>
        <div className="towers" style={{
          position: "absolute",
          bottom: "0",
          left: "20px",
          height: "200px"
        }}>
          {/* This would be replaced with an actual image in production */}
          <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
            {/* Twin towers silhouette would be here */}
          </div>
        </div>
        <div className="airplane" style={{
          position: "absolute",
          bottom: "80px",
          right: "20px",
          transform: "rotate(-10deg)",
          fontSize: "10px",
          color: "rgba(255,255,255,0.5)"
        }}>
          {/* Airplane silhouette would be here */}
        </div>
      </div>
    </div>
  );
}

export default CreateProjectComponent;