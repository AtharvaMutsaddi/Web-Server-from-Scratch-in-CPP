let times = [];
let responsetimes = [];
let buttonClicked = false;
let buttonClickedPost = false;
let requestCounter = 0;
const maxRequests = 20;
let intervalId;
PORT=3000
let averageResponseTime = 0;
let highestResponseTime = 0;
let lowestResponseTime = Infinity;

// Initialize the Chart.js chart
const ctx = document.getElementById("chart").getContext("2d");
const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [], // X-axis labels (empty to start)
    datasets: [
      {
        label: "Response Times",
        borderColor: "rgb(75, 192, 192)",
        data: [], // Response time data (empty to start)
      },
    ],
  },
  options: {
    scales: {
      x: {
        type: "linear",
        position: "bottom",
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});

function updateMetrics() {
  const totalResponseTime = responsetimes.reduce((acc, time) => acc + time, 0);
  averageResponseTime = totalResponseTime / responsetimes.length;
  highestResponseTime = Math.max(...responsetimes);
  lowestResponseTime = Math.min(...responsetimes);

  document.getElementById("performanceMetrics").innerHTML = `
          Average Response Time: ${averageResponseTime} ms<br>
          Highest Response Time: ${highestResponseTime} ms<br>
          Lowest Response Time: ${lowestResponseTime} ms
        `;
}

function sendGetRequest() {
  if (requestCounter < maxRequests) {
    // Capture the start time before making the request
    const startTime = performance.now();

    fetch(`http://localhost:${PORT}`)
      .then(function (response) {
        // Capture the end time when the response is received
        const endTime = performance.now();

        return response.text().then(function (data) {
          // Calculate the request and response time
          const responseTime = endTime - startTime;
          times.push(startTime);
          responsetimes.push(responseTime);

          // Update the content in the "responseContent" div
          document.getElementById("responseContent").innerHTML = data;
          document.getElementById("performanceMetrics").innerHTML = `
          Response Time: ${responseTime} ms<br>`;
          // Update the chart data
          chart.data.labels = times;
          chart.data.datasets[0].data = responsetimes;
          chart.update();

          requestCounter++;

          if (requestCounter === maxRequests) {
            clearInterval(intervalId); // Stop the interval when the limit is reached
            updateMetrics(); // Calculate metrics after all 20 requests
          }
        });
      })
      .catch(function (error) {
        console.error("Error: " + error);
      });
  }
}

function startRequests() {
  if (!buttonClicked) {
    buttonClicked = true;
    document.getElementById("startButton").disabled = true;
    intervalId = setInterval(sendGetRequest, 1000); // Store intervalId
  }
}

function sendPostRequest() {
  const postData = document.getElementById("postData").value;
  const startTime = performance.now();
  fetch(`http://localhost:${PORT}`, {
    method: "POST",
    body: JSON.stringify({ data: postData }),
  })
    .then(function (response) {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      return response.text().then(function (data) {
        document.getElementById(
          "postresponseContent"
        ).innerHTML = `${data} <br> Response time: ${responseTime} ms`;
      });
    })
    .catch(function (error) {
      console.error("Error: " + error);
    });
}
function startPostRequests() {
  sendPostRequest();
}
