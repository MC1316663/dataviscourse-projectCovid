/** Class implementing the table. */
class Content {
  /**
   * Creates a Table Object
   */
  constructor(sd_eachCBG, sd_graph, slc_Covid, slc_Json) {

      // Data Load
        this.sd_eachCBG = sd_eachCBG;
        this.sd_graph = sd_graph;
        this.slc_Covid = slc_Covid;
        this.slc_Json = slc_Json;

    this.MARGIN = {left: 33, bottom: 20, top: 10, right: 5};

    this.covidCaseGraph();
    this.homeGraph();
    this.outdoorGraph();
    this.workDeviceGraph();

    console.log("sd_graph: ", sd_graph);
  }
  /**
     * Bar chart for covid case graph
  */
  covidCaseGraph(){
    let CHART_WIDTH = parseInt(d3.select('#CovidCaseG').style('width'));
    let CHART_HEIGHT = parseInt(d3.select('#CovidCaseG').style('height'));
    //d3 setting up
    let covidSVG = d3.select('#CovidCaseG')
      .append('svg')
      .attr('id', 'covidCase-svg')
      .attr("width", CHART_WIDTH)
      .attr("height", CHART_HEIGHT);
    
    let xAxisG = covidSVG.append('g')
      .attr('id', 'covidCase-x-axis');

    let yAxisG = covidSVG.append('g')
      .attr('id', 'covidCase-y-axis');

    let covidCaseG = covidSVG.append('g')
      .attr('id', 'covidCase')
      .attr('class', 'covid-case');

    //set up bar chart scales
    const xScale = d3.scaleBand()
      .domain(this.slc_Covid.map(d => d.date))
      .range([this.MARGIN.left, CHART_WIDTH]);

    const cases = this.slc_Covid.map(d => d.InfC).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(cases)])
      .range([CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.slc_Covid.map(d => d.date).length/4);
    xAxisG.attr('transform', `translate(0,${CHART_HEIGHT - this.MARGIN.bottom})`)
      .call(d3.axisBottom(xScale).tickValues(this.slc_Covid.map((d, i) => {
        if(i % tickPts == 0){
          return d.date;
        }
      }).filter(d => d)))
      .selectAll('path')
      .remove();

    yAxisG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .call(d3.axisLeft(yScale).ticks(4))
      .selectAll('path')
      .remove();

    //draw bar chart
    covidCaseG.selectAll('rect')
      .data(this.slc_Covid, d => d.date)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.InfC))
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d.InfC) + this.MARGIN.top)
      .attr('opacity', 1)
      .attr('classed', 'covid-case');
  }

  /**
   * Bar chart for median home spending time graph
   */
  homeGraph(){
    let CHART_WIDTH = parseInt(d3.select('#Home').style('width'));
    let CHART_HEIGHT = parseInt(d3.select('#Home').style('height'));

    //d3 setting up
    let homeSVG = d3.select('#Home')
      .append('svg')
      .attr('id', 'home-svg')
      .attr("width", CHART_WIDTH)
      .attr("height", CHART_HEIGHT);
    
    let xAxisG = homeSVG.append('g')
      .attr('id', 'home-x-axis');

    let yAxisG = homeSVG.append('g')
      .attr('id', 'home-y-axis');

    let homeG = homeSVG.append('g')
      .attr('id', 'home')
      .attr('class', 'home-g');

    const formatTime = d3.timeFormat('%m, %d, %Y')
    console.log(this.sd_graph.map(d => d.date_range_start))

    //set up bar chart scales
    const xScale = d3.scaleBand()
      .domain(this.sd_graph.map(d => d.date_range_start))
      .range([this.MARGIN.left, CHART_WIDTH]);

    const counts = this.sd_graph.map(d => d.median_home_dwell_time).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(counts)])
      .range([CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.sd_graph.map(d => d.date_range_start).length/4);
    xAxisG.attr('transform', `translate(0,${CHART_HEIGHT - this.MARGIN.bottom})`)
      .call(d3.axisBottom(xScale).tickValues(this.sd_graph.map((d, i) => {
        if(i % tickPts == 0){
          return d.date_range_start;
        }
      }).filter(d => d)))
      .selectAll('path')
      .remove();

    yAxisG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .call(d3.axisLeft(yScale).ticks(3))
      .selectAll('path')
      .remove();

    //draw bar chart
    homeG.selectAll('rect')
      .data(this.sd_graph, d => d.date_range_start)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.median_home_dwell_time))
      .attr('x', d => xScale(d.date_range_start))
      .attr('y', d => yScale(d.median_home_dwell_time) + this.MARGIN.top)
      .attr('opacity', 1)
      .attr('classed', 'home-g');
  }

  /**
   * Bar chart for median outdoor spending time graph
   */
   outdoorGraph(){
    let CHART_WIDTH = parseInt(d3.select('#Others').style('width'));
    let CHART_HEIGHT = parseInt(d3.select('#Others').style('height'));

    //d3 setting up
    let outdoorSVG = d3.select('#Others')
      .append('svg')
      .attr('id', 'outdoor-svg')
      .attr("width", CHART_WIDTH)
      .attr("height", CHART_HEIGHT);
    
    let xAxisG = outdoorSVG.append('g')
      .attr('id', 'outdoor-x-axis');

    let yAxisG = outdoorSVG.append('g')
      .attr('id', 'outdoor-y-axis');

    let outdoorG = outdoorSVG.append('g')
      .attr('id', 'outdoor')
      .attr('class', 'outdoor-g');

    //set up bar chart scales
    const xScale = d3.scaleBand()
      .domain(this.sd_graph.map(d => d.date_range_start))
      .range([this.MARGIN.left, CHART_WIDTH]);

    const counts = this.sd_graph.map(d => d.median_non_home_dwell_time).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(counts)])
      .range([CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.sd_graph.map(d => d.date_range_start).length/4);
    xAxisG.attr('transform', `translate(0,${CHART_HEIGHT - this.MARGIN.bottom})`)
      .call(d3.axisBottom(xScale).tickValues(this.sd_graph.map((d, i) => {
        if(i % tickPts == 0){
          return d.date_range_start;
        }
      }).filter(d => d)))
      .selectAll('path')
      .remove();

    yAxisG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .call(d3.axisLeft(yScale).ticks(3))
      .selectAll('path')
      .remove();

    //draw bar chart
    outdoorG.selectAll('rect')
      .data(this.sd_graph, d => d.date_range_start)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.median_non_home_dwell_time))
      .attr('x', d => xScale(d.date_range_start))
      .attr('y', d => yScale(d.median_non_home_dwell_time) + this.MARGIN.top)
      .attr('opacity', 1)
      .attr('classed', 'outdoor-g');
  }

  /**
   * Bar chart for work devices count graph
   */
   workDeviceGraph(){
    let CHART_WIDTH = parseInt(d3.select('#Work').style('width'));
    let CHART_HEIGHT = parseInt(d3.select('#Work').style('height'));

    //d3 setting up
    let workSVG = d3.select('#Work')
      .append('svg')
      .attr('id', 'work-svg')
      .attr("width", CHART_WIDTH)
      .attr("height", CHART_HEIGHT);
    
    let xAxisG = workSVG.append('g')
      .attr('id', 'work-x-axis');

    let yAxisG = workSVG.append('g')
      .attr('id', 'work-y-axis');

    let workG = workSVG.append('g')
      .attr('id', 'work')
      .attr('class', 'work-g');

    //set up bar chart scales
    const xScale = d3.scaleBand()
      .domain(this.sd_graph.map(d => d.date_range_start))
      .range([this.MARGIN.left, CHART_WIDTH]);

    const counts = this.sd_graph.map(d => d.sum_work_behavior_device).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(counts)])
      .range([CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.sd_graph.map(d => d.date_range_start).length/4);
    xAxisG.attr('transform', `translate(0,${CHART_HEIGHT - this.MARGIN.bottom})`)
      .call(d3.axisBottom(xScale).tickValues(this.sd_graph.map((d, i) => {
        if(i % tickPts == 0){
          return d.date_range_start;
        }
      }).filter(d => d)))
      .selectAll('path')
      .remove();

    yAxisG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(d3.format(".2s")))
      .selectAll('path')
      .remove();

    //draw bar chart
    workG.selectAll('rect')
      .data(this.sd_graph, d => d.date_range_start)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.sum_work_behavior_device))
      .attr('x', d => xScale(d.date_range_start))
      .attr('y', d => yScale(d.sum_work_behavior_device) + this.MARGIN.top)
      .attr('opacity', 1)
      .attr('classed', 'work-g');
  }

  map(){

    const that = this;
    let map;
  
    function initMap() {
      map = new google.maps.Map(d3.select("#Map").node(), {
        center: { lat: 40.69, lng: -111.906 },
        zoom: 10,
      });
      map.data.addGeoJson(
        //'./data/CBG_SaltLakeCounty.geojson' //this works but from path.
          that.slc_Json
      );
  
      // FOr choropleth Map: 
      //https://developers.google.com/maps/documentation/javascript/dds-boundaries/choropleth-map
      //Think that works?
  
      map.data.setStyle({
        fillColor: "green",
        fillOpacity: 0.2,
        strokeWeight: 0.2
      });
  
    }

      initMap(); // Generate Map

}
}
