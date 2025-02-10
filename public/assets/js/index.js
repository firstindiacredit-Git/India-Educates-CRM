document.addEventListener("DOMContentLoaded", function () {
  const chartElement = document.querySelector("#chart-element-id");
  if (chartElement) {
    // Initialize ApexCharts
    const chart = new ApexCharts(chartElement, options);
    chart.render();
  }
});
