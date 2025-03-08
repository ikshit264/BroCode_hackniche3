import { useState } from "react";
import { Web3Storage } from 'web3.storage';

function CreateProjectComponent(props) {
  const [formInput, setFormInput] = useState({
    projectName: "",
    projectCategory: "",
    projectDescription: "",
    creatorName: "",
    refundPolicy: "refundable", // Default refund policy set to refundable
    social: "",
    fundingGoal: 0,
    duration: 1,
    projectImage: "",
    projectLink: "",
  });

  const [inputImage, setInputImage] = useState(null);

  // Set the form input state if input changes
  function handleChange(e) {
    const { name, value } = e.target;
    setFormInput({
      ...formInput,
      [name]: value
    });
  }

  // Read the input image file
  async function handleImageChange(e) {
    setInputImage(e.target.files[0]);
  }

  // Submit the form input data to smart contract
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
    const fundingGoal = parseFloat(formInput.fundingGoal) * 10**18; // Convert to wei (1e18)
    const duration = parseFloat(formInput.duration) * 60; // Convert to seconds

    // Get category code
    const categoryCode = {
      "designandtech": 0,
      "film": 1,
      "arts": 2,
      "games": 3,
    }[formInput.projectCategory.toLowerCase()] || 0;

    // Get refund policy code
    const refundPolicyCode = {
      "refundable": 0,
      "non-refundable": 1,
    }[formInput.refundPolicy.toLowerCase()] || 0;

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
                  border: "2px solid #ddd", // Added border
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
                  border: "2px solid #ddd", // Added border
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Funding Goal (in ETH)</label>
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
                  border: "2px solid #ddd", // Added border
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
                  border: "2px solid #ddd", // Added border
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="form-right">
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Project Category</label>
              <select
                name="projectCategory"
                onChange={handleChange}
                value={formInput.projectCategory}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "5px",
                  border: "2px solid #ddd", // Added border
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              >
                <option value="designandtech">DESIGNANDTECH</option>
                <option value="film">FILM</option>
                <option value="arts">ARTS</option>
                <option value="games">GAMES</option>
              </select>
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
                  border: "2px solid #ddd", // Added border
                  backgroundColor: "rgba(255, 255, 255, 0.7)"
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Refund Policy</label>
              <div style={{ display: "flex", alignItems: "center" }}>
                <label style={{ marginRight: "10px" }}>Refundable</label>
                <input
                  type="radio"
                  name="refundPolicy"
                  value="refundable"
                  onChange={handleChange}
                  checked={formInput.refundPolicy === "refundable"}
                  style={{ marginRight: "10px" }}
                />
                <label style={{ marginRight: "10px" }}>Non-Refundable</label>
                <input
                  type="radio"
                  name="refundPolicy"
                  value="non-refundable"
                  onChange={handleChange}
                  checked={formInput.refundPolicy === "non-refundable"}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Duration (in days)</label>
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
                  border: "2px solid #ddd", // Added border
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
                  border: "2px solid #ddd", // Added border
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
    </div>
  );
}

export default CreateProjectComponent;
