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
  
    // vis charts and map
    this.covidCaseGraph();
    this.homeGraph();
    this.outdoorGraph();
    this.workDeviceGraph();
    this.map();

    // add listners on buttons (work, home, other behaviours) upper map

    this.changeType();
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
      .attr('viewBox', `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`)
      .attr('id', 'covidCase-svg')
      .attr("width", '100%')
      .attr("height", '100%');
    
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
      .range([0, CHART_WIDTH-this.MARGIN.left-this.MARGIN.right]);

    const cases = this.slc_Covid.map(d => d.InfC).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(cases)])
      .range([CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.slc_Covid.map(d => d.date).length/4);
    xAxisG.attr('transform', `translate(${this.MARGIN.left},${CHART_HEIGHT - this.MARGIN.bottom})`)
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
    covidCaseG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .selectAll('rect')
      .data(this.slc_Covid, d => d.date)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.InfC))
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d.InfC))
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
      .attr('viewBox', `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`)
      .attr('id', 'home-svg')
      .attr("width", '100%')
      .attr("height", '100%');
    
    let xAxisG = homeSVG.append('g')
      .attr('id', 'home-x-axis');

    let yAxisG = homeSVG.append('g')
      .attr('id', 'home-y-axis');

    let homeG = homeSVG.append('g')
      .attr('id', 'home')
      .attr('class', 'home-g');

    const formatTime = d3.timeFormat('%m, %d, %Y')
    //console.log(this.sd_graph.map(d => d.date_range_start))

    //set up bar chart scales
    const xScale = d3.scaleBand()
      .domain(this.sd_graph.map(d => d.date_range_start))
      .range([0, CHART_WIDTH-this.MARGIN.left-this.MARGIN.right]);

    const counts = this.sd_graph.map(d => d.median_home_dwell_time).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(counts)])
      .range([CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.sd_graph.map(d => d.date_range_start).length/4);
    xAxisG.attr('transform', `translate(${this.MARGIN.left}, ${CHART_HEIGHT - this.MARGIN.bottom})`)
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
    homeG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .selectAll('rect')
      .data(this.sd_graph, d => d.date_range_start)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.median_home_dwell_time))
      .attr('x', d => xScale(d.date_range_start))
      .attr('y', d => yScale(d.median_home_dwell_time))
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
      .attr('viewBox', `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`)
      .attr('id', 'outdoor-svg')
      .attr("width", '100%')
      .attr("height", '100%');
    
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
      .range([0, CHART_WIDTH-this.MARGIN.left-this.MARGIN.right]);

    const counts = this.sd_graph.map(d => d.median_non_home_dwell_time).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(counts)])
      .range([CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.sd_graph.map(d => d.date_range_start).length/4);
    xAxisG.attr('transform', `translate(${this.MARGIN.left},${CHART_HEIGHT - this.MARGIN.bottom})`)
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
    outdoorG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .selectAll('rect')
      .data(this.sd_graph, d => d.date_range_start)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.median_non_home_dwell_time))
      .attr('x', d => xScale(d.date_range_start))
      .attr('y', d => yScale(d.median_non_home_dwell_time))
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
      .attr('viewBox', `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`)
      .attr('id', 'work-svg')
      .attr("width", '100%')
      .attr("height", '100%');
    
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
      .range([0, CHART_WIDTH-this.MARGIN.left-this.MARGIN.right]);

    const counts = this.sd_graph.map(d => d.sum_work_behavior_device).map(d => parseInt(d, 10));
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(counts)])
      .range([CHART_HEIGHT - this.MARGIN.bottom - this.MARGIN.top, 0])
      .nice();

    //set up bar chart axises
    const tickPts = Math.round(this.sd_graph.map(d => d.date_range_start).length/4);
    xAxisG.attr('transform', `translate(${this.MARGIN.left},${CHART_HEIGHT - this.MARGIN.bottom})`)
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
    workG.attr('transform', `translate(${this.MARGIN.left}, ${this.MARGIN.top})`)
      .selectAll('rect')
      .data(this.sd_graph, d => d.date_range_start)
      .join('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.sum_work_behavior_device))
      .attr('x', d => xScale(d.date_range_start))
      .attr('y', d => yScale(d.sum_work_behavior_device))
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
  
      //Chropleth map
      // map.data.setStyle({
      //   fillColor: "green",
      //   fillOpacity: 0.2,
      //   strokeWeight: 0.2
      // });

      //Example -----> min and max for classification of choroplethmap!
      console.log("asd",that.slc_Json.features)
      const maxV = d3.max(that.slc_Json.features, function(d){
        //console.log(d.properties.TRACTCE20)
        return parseInt(d.properties.FID);
      })
      const minV = d3.min(that.slc_Json.features, function(d){
        return parseInt(d.properties.FID);
      })
      
      map.data.setStyle(function(d){    //Style for Choropleth map
        const value = d.j.FID        
        if(value >= minV && value < (minV+maxV)/3){
          var color =  "green"
        }
        else if(value >= (minV+maxV)/3 && value < (minV+maxV)/2){
          var color = "grey"
        }
        else if(value >= (minV+maxV)/2 && value < (minV+maxV)/1.5){
          var color = "blue"
        }
        else{
          var color = "red"
        }
        return{
          fillColor: color,
          fillOpacity: 0.2,
          strokeWeight: 0.2
        }
      });
      
      // On click function:
      //https://developers.google.com/maps/documentation/javascript/datalayer
    }

    initMap(); // Generate Map

  }

  /**
   * change the type of activity
   * add listners on buttons (work, home, other behaviours) upper map
   */
  changeType(){
    let that = this;
    d3.select('#mapNav').selectAll('button')
      .on('click', function(){
        let attr = d3.select(this).attr('activity');
        
      })
  }

}
