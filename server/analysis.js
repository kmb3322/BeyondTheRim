// server/analysis.js

async function runAnalysis(s3Key) {
  console.log(`Running ML analysis on file: ${s3Key}`);
  //const randomScore = Math.floor(Math.random() * 101);
  return {
    //score: randomScore,
    score: 0,
    message: 'Analysis complete!',
  };
}

module.exports = { runAnalysis };
