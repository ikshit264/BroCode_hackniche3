import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import styles from "./MasonryGrid.module.css";
import { Link } from "react-router-dom";

export default function MasonryGrid({ projects }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Function to truncate text
  const truncateText = (text, maxLength) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  // Limit to 4 projects and apply custom heights
  const modifiedProjects = projects.slice(0, 4).map((project, index) => {
    const isSmall = index === 0 || index === 3;
    return {
      ...project,
      height: isSmall ? styles.h64 : styles.h80, // Smaller for first & last
      truncatedDescription: truncateText(project.description, isSmall ? 200 : 350),
    };
  });

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {modifiedProjects.map((project, index) => (
          <Link
            key={index}
            to={{
              pathname: "/project",
            }}
            state={{ project }} // Pass project details as state
            className="project-card"
          >
            <motion.div
              key={project.id}
              initial={{ height: 0, opacity: 0 }}
              animate={
                isLoaded
                  ? { height: "auto", opacity: 1 }
                  : { height: 0, opacity: 0 }
              }
              transition={{
                duration: 0.5,
                delay: index * 0.2,
                ease: "easeOut",
              }}
              className={styles.cardWrapper}
            >
              <div className="relative">
                {/* Background rectangle (offset to top-right) */}
                <div className={styles.backgroundRectangle}></div>

                {/* Main project card with border */}
                <div className={`${styles.card} ${project.height}`}>
                  <div className="h-full flex flex-col">
                    <h3 className={styles.title}>{project.title}</h3>
                    <span className={styles.tag}>{project.tag}</span>
                    <p className={styles.description}>
                      {project.truncatedDescription}
                    </p>
                    <div className="mt-4">
                      <button className={styles.button}>Learn More</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
