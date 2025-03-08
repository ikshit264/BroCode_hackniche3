// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract Crowdfunding {
    enum Category {
        DESIGNANDTECH,
        FILM,
        ARTS,
        GAMES
    }
    enum RefundPolicy {
        REFUNDABLE,
        NONREFUNDABLE
    }

    struct Project {
        string projectName;
        string projectDescription;
        string creatorName;
        string projectLink;
        string cid;
        uint256 fundingGoal;
        uint256 duration;
        uint256 creationTime;
        uint256 amountRaised;
        address creatorAddress;
        Category category;
        RefundPolicy refundPolicy;
        address[] contributors;
        uint256[] amount;
        bool[] refundClaimed;
        bool claimedAmount;
    }

    // Structure used to return metadata of each project
    struct ProjectMetadata {
        string projectName;
        string projectDescription;
        string creatorName;
        string cid;
        uint256 fundingGoal;
        uint256 amountRaised;
        uint256 totalContributors;
        uint256 creationTime;
        uint256 duration;
        Category category;
    }

    // Stores all the projects
    Project[] projects;

    // Stores the indexes of projects created on projects list by an address
    mapping(address => uint256[]) addressProjectsList;

    // Stores the list of fundings by an address
    mapping(address => Funded[]) addressFundingList;

    // Reputation system
    mapping(address => uint256) reputationScore;

    // Each user funding gets recorded in Funded structure
    struct Funded {
        uint256 projectIndex;
        uint256 totalAmount;
    }

    modifier validIndex(uint256 _index) {
        require(_index < projects.length, "Invalid Project Id");
        _;
    }

    // Create a new project and updates the addressProjectsList and projects array
    // Create a new project and updates the addressProjectsList and projects array
    function createNewProject(
        string memory _name,
        string memory _desc,
        string memory _creatorName,
        string memory _projectLink,
        string memory _cid,
        uint256 _fundingGoal,
        uint256 _duration,
        Category _category,
        RefundPolicy _refundPolicy
    ) external {
        // Fixed: Properly initializing empty arrays
        address[] memory emptyAddressArray = new address[](0);
        uint256[] memory emptyUintArray = new uint256[](0);
        bool[] memory emptyBoolArray = new bool[](0);
        
        projects.push(Project({
            creatorAddress: msg.sender,
            projectName: _name,
            projectDescription: _desc,
            creatorName: _creatorName,
            projectLink: _projectLink,
            cid: _cid,
            fundingGoal: _fundingGoal * 10**18,
            duration: _duration * (1 minutes),
            creationTime: block.timestamp,
            category: _category,
            refundPolicy: _refundPolicy,
            amountRaised: 0,
            contributors: emptyAddressArray,
            amount: emptyUintArray,
            claimedAmount: false,
            refundClaimed: emptyBoolArray
        }));
        
        addressProjectsList[msg.sender].push(projects.length - 1);
    }


    // Returns the project metadata of all entries in projects
    function getAllProjectsDetail()
        external
        view
        returns (ProjectMetadata[] memory allProjects)
    {
        uint256 totalProjects = projects.length;
        ProjectMetadata[] memory newList = new ProjectMetadata[](totalProjects);

        for (uint256 i = 0; i < totalProjects; i++) {
            newList[i] = createProjectMetadata(i);
        }

        return newList;
    }

    // Helper function to return the metadata for a specific project index
    function createProjectMetadata(uint256 i)
        internal
        view
        returns (ProjectMetadata memory)
    {
        Project storage project = projects[i];
        return
            ProjectMetadata(
                project.projectName,
                project.projectDescription,
                project.creatorName,
                project.cid,
                project.fundingGoal,
                project.amountRaised,
                project.contributors.length,
                project.creationTime,
                project.duration,
                project.category
            );
    }

    // Returns the project at the given index
    function getProject(uint256 _index)
        external
        view
        validIndex(_index)
        returns (Project memory project)
    {
        return projects[_index];
    }

    // Returns array of indexes of projects created by creator
    function getCreatorProjects(address creator)
        external
        view
        returns (uint256[] memory createdProjects)
    {
        return addressProjectsList[creator];
    }

    // Returns array of details of fundings by the contributor
    function getUserFundings(address contributor)
        external
        view
        returns (Funded[] memory fundedProjects)
    {
        return addressFundingList[contributor];
    }

    // Helper function adds details of Funding to addressFundingList
    function addToFundingList(uint256 _index) internal validIndex(_index) {
        for (uint256 i = 0; i < addressFundingList[msg.sender].length; i++) {
            if (addressFundingList[msg.sender][i].projectIndex == _index) {
                addressFundingList[msg.sender][i].totalAmount += msg.value;
                return;
            }
        }
        addressFundingList[msg.sender].push(Funded(_index, msg.value));
    }

    // Helper function adds details of funding to the project in projects array
    function addContribution(uint256 _index) internal validIndex(_index) {
        for (uint256 i = 0; i < projects[_index].contributors.length; i++) {
            if (projects[_index].contributors[i] == msg.sender) {
                projects[_index].amount[i] += msg.value;
                addToFundingList(_index);
                return;
            }
        }
        projects[_index].contributors.push(msg.sender);
        projects[_index].amount.push(msg.value);
        if (projects[_index].refundPolicy == RefundPolicy.REFUNDABLE) {
            projects[_index].refundClaimed.push(false);
        }
        addToFundingList(_index);
    }

    // Funds the projects at given index
    function fundProject(uint256 _index) external payable validIndex(_index) {
        require(
            projects[_index].creatorAddress != msg.sender,
            "You are the project owner"
        );
        require(
            projects[_index].duration + projects[_index].creationTime >=
                block.timestamp,
            "Project Funding Time Expired"
        );
        addContribution(_index);
        projects[_index].amountRaised += msg.value;

        reputationScore[msg.sender] += 2; // Contributors gain rep for funding
    }

    // Helps project creator to transfer the raised funds to his address
    function claimFund(uint256 _index) external validIndex(_index) {
        require(
            projects[_index].creatorAddress == msg.sender,
            "You are not Project Owner"
        );
        require(
            projects[_index].duration + projects[_index].creationTime <
                block.timestamp,
            "Project Funding Time Not Expired"
        );
        require(
            projects[_index].refundPolicy == RefundPolicy.NONREFUNDABLE ||
                projects[_index].amountRaised >= projects[_index].fundingGoal,
            "Funding goal not reached"
        );
        require(
            !projects[_index].claimedAmount,
            "Already claimed raised funds"
        );
        projects[_index].claimedAmount = true;
        payable(msg.sender).transfer(projects[_index].amountRaised);

        reputationScore[msg.sender] += 5; // Boost reputation for successful project completion
    }

    // Helper function to get the contributor index in the projects' contributor's array
    function getContributorIndex(uint256 _index)
        internal
        view
        validIndex(_index)
        returns (int256)
    {
        int256 contributorIndex = -1;
        for (uint256 i = 0; i < projects[_index].contributors.length; i++) {
            if (msg.sender == projects[_index].contributors[i]) {
                contributorIndex = int256(i);
                break;
            }
        }
        return contributorIndex;
    }

    // Enables the contributors to claim refund when refundable project doesn't reach its goal
    function claimRefund(uint256 _index) external validIndex(_index) {
        require(
            projects[_index].duration + projects[_index].creationTime <
                block.timestamp,
            "Project Funding Time Not Expired"
        );
        require(
            projects[_index].refundPolicy == RefundPolicy.REFUNDABLE &&
                projects[_index].amountRaised < projects[_index].fundingGoal,
            "Funding goal not reached"
        );

        int256 index = getContributorIndex(_index);
        require(index != -1, "You did not contribute to this project");

        uint256 contributorIndex = uint256(index);
        require(
            contributorIndex < projects[_index].refundClaimed.length,
            "Refund information not available"
        );
        require(
            !projects[_index].refundClaimed[contributorIndex],
            "Already claimed refund amount"
        );

        projects[_index].refundClaimed[contributorIndex] = true;
        payable(msg.sender).transfer(projects[_index].amount[contributorIndex]);

        reputationScore[msg.sender] -= 1; // Small deduction to prevent refund abuse
        reputationScore[projects[_index].creatorAddress] -= 5; // Creator penalized for failed funding
    }

    // Get the reputation score of a user
    function getReputation(address _user) external view returns (uint256) {
        return reputationScore[_user];
    }
}
