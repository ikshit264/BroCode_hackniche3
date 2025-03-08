import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import styles from "./MasonryGrid.module.css"

export default function MasonryGrid({ cards }) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Function to truncate text
  const truncateText = (text, maxLength) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
  }

  // Limit to 4 cards and apply custom heights
  const modifiedCards = cards.slice(0, 4).map((card, index) => {
    const isSmall = index === 0 || index === 3
    return {
      ...card,
      height: isSmall ? styles.h64 : styles.h80, // Smaller for first & last
      truncatedDescription: truncateText(card.description, isSmall ? 200 : 350),
    }
  })

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {modifiedCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ height: 0, opacity: 0 }}
            animate={isLoaded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
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

              {/* Main card with border */}
              <div className={`${styles.card} ${card.height}`}>
                <div className="h-full flex flex-col">
                  <h3 className={styles.title}>{card.title}</h3>
                  <span className={styles.tag}>{card.tag}</span>
                  <p className={styles.description}>{card.truncatedDescription}</p>
                  <div className="mt-4">
                    <button className={styles.button}>Learn More</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
