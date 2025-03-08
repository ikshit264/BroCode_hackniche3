import CategoryComponent from "./CategoryComponent";
import MasonryGrid from "./MasonryGrid";
import { useEffect, useState } from "react";
import dummyPic from "../assets/pg1.jpg";
import { useLocation } from "react-router-dom";
import styles from "./DiscoverComponent.module.css";

export default function DiscoverComponent(props) {
  const location = useLocation();
  const [filter, setFilter] = useState(
    location?.state?.selected >= 0 ? location.state.selected : -1
  );
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  const changeFilter = (val) => {
    setFilter(val);
    setCurrentPage(0);
  };

  const getAllProjects = async () => {
    try {
      let res = await props.contract.getAllProjectsDetail().then((res) => {
        return res.map((project, index) => ({
          amountRaised: project.amountRaised,
          cid: project.cid,
          creatorName: project.creatorName,
          fundingGoal: project.fundingGoal,
          projectDescription: project.projectDescription,
          projectName: project.projectName,
          totalContributors: project.totalContributors,
          index,
          category: project.category,
        }));
      });

      if (filter !== -1) {
        res = res.filter((project) => project.category === filter);
      }

      setProjects(res);
    } catch (err) {
      alert(err);
      console.log(err);
    }
  };

  useEffect(() => {
    getAllProjects();
  }, [filter]);

  const totalPages = Math.ceil(projects.length / itemsPerPage);
  const paginatedProjects = projects.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <>
      <CategoryComponent filter={filter} changeCategory={changeFilter} />
      <div className={styles.discoverHeading}>Discover</div>
      <div className={styles.paginationContainer}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
          className={`${styles.paginationButton} ${
            currentPage === 0 ? "" : styles.paginationButtonEnabled
          }`}
        >
          Previous
        </button>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage === totalPages - 1}
          className={`${styles.paginationButton} ${
            currentPage === totalPages - 1 ? "" : styles.paginationButtonEnabled
          }`}
        >
          Next
        </button>
      </div>
      {paginatedProjects.length > 0 ? (
        <MasonryGrid
          cards={paginatedProjects.map((project) => ({
            id: project.index,
            title: project.projectName,
            description: project.projectDescription,
            tag: project.creatorName,
            image: project.cid ? `https://${project.cid}` : dummyPic,
            height: "h-80",
          }))}
        />
      ) : (
        <div className={styles.noProjects}>No projects found</div>
      )}
    </>
  );
}
