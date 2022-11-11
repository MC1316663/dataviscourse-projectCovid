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
      
      this.MARGIN = {left: 32, bottom: 20, top: 10, right: 5};
      this.covidCaseGraph();
      this.map();

    console.log("sd_eachCBG: ", sd_eachCBG)
    console.log("sd_graph: ", sd_graph)
    console.log("slc_Covid: ", slc_Covid)
    console.log("slc_Json: ", slc_Json)
      

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
