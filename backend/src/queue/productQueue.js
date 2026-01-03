// Simple in-memory queue for product write operations

const productQueue = [];

/**
 * Add a job to queue
 * @param {String} type
 * @param {Object} payload
 */
const addToQueue = (type, payload) => {
  productQueue.push({
    type,
    payload,
    createdAt: new Date(),
  });
};

/**
 * Get next job from queue
 */
const getNextJob = () => {
  if (productQueue.length === 0) return null;
  return productQueue.shift();
};

export {
  addToQueue,
  getNextJob,
};
